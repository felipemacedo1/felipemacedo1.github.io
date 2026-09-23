import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  LineSegments,
  LineBasicMaterial,
  Color,
  AdditiveBlending,
} from 'three';

/** One renderer, one reusable point field. The active diagram sets its viewport. */
export function startScene() {
  const mobile = matchMedia('(max-width: 760px)').matches;
  const count = mobile ? 380 : 850;
  const canvas = document.createElement('canvas');
  canvas.className = 'graphics-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  document.body.append(canvas);
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 9;
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, (_, i) => ({
    u: (i * 0.61803398875) % 1,
    v: (i * 0.754877666) % 1,
  }));
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const material = new PointsMaterial({
    color: new Color('#addce7'),
    size: mobile ? 0.023 : 0.021,
    transparent: true,
    opacity: 0.8,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  scene.add(points);
  const lineGeometry = new BufferGeometry();
  const linePositions = new Float32Array(240 * 6);
  lineGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
  const lines = new LineSegments(
    lineGeometry,
    new LineBasicMaterial({ color: 0x76b2c4, transparent: true, opacity: 0.13, depthWrite: false }),
  );
  scene.add(lines);
  const panels = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
  let active: HTMLElement | undefined;
  let mode = 'hero';
  let frame = 0;
  let last = 0;
  let dirty = true;
  let visible = true;
  const reduced = () => document.documentElement.dataset.motion === 'reduced';
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    dirty = true;
  }
  function choose() {
    active = panels
      .filter((p) => {
        const r = p.getBoundingClientRect();
        return r.bottom > 110 && r.top < innerHeight;
      })
      .sort(
        (a, b) =>
          Math.abs(a.getBoundingClientRect().top + a.clientHeight / 2 - innerHeight / 2) -
          Math.abs(b.getBoundingClientRect().top + b.clientHeight / 2 - innerHeight / 2),
      )[0];
    if (active) mode = active.dataset.scene || 'hero';
    panels.forEach((p) => (p.dataset.active = String(p === active)));
    dirty = true;
    if (!active) {
      renderer.setScissorTest(false);
      renderer.clear();
    }
    requestDraw();
  }
  function setTarget(i: number, t: number) {
    const { u, v } = seeds[i];
    let x = 0,
      y = 0,
      z = 0;
    if (mode === 'hero') {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count),
        theta = i * 2.39996323 + t * 0.025;
      const radius = 2.35 + 0.04 * Math.sin(theta * 3 + t * 0.3);
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.cos(phi);
      z = radius * Math.sin(phi) * Math.sin(theta);
      const tilt = -0.26;
      const px = x;
      x = px * Math.cos(tilt) - y * Math.sin(tilt);
      y = px * Math.sin(tilt) + y * Math.cos(tilt);
    } else if (mode === 'audio') {
      x = (i / count - 0.5) * 8;
      y =
        Math.sin(i * 0.15 + t * 1.5) *
        Math.sin((i / count) * Math.PI) *
        0.65 *
        (0.3 + 0.7 * Math.sin(i * 0.038) ** 2);
      z = (v - 0.5) * 0.3;
    } else if (mode === 'radar') {
      const path = [
        [85, 95],
        [220, 80],
        [355, 160],
        [485, 245],
        [570, 245],
      ];
      const progress = (u + t * 0.05) % 1;
      const part = Math.min(3, Math.floor(progress * 4));
      const f = progress * 4 - part;
      x = ((path[part][0] * (1 - f) + path[part + 1][0] * f) / 640 - 0.5) * 8;
      y = (0.5 - (path[part][1] * (1 - f) + path[part + 1][1] * f) / 330) * 4.125;
      z = 0;
      if (i > count * 0.12) {
        x = 20;
        y = 20;
      }
    } else if (mode === 'mapping') {
      const row = i % 4;
      const f = (u + t * 0.05) % 1;
      x = ((f * 210 + 205 - 320) / 640) * 8;
      y = ((165 - (60 + row * 65)) / 330) * 4.125;
      z = 0;
      if (i > count * 0.12) {
        x = 20;
        y = 20;
      }
    } else {
      const row = i % 5;
      const f = (u + t * 0.07) % 1;
      x = ((180 + row * 28 + f * (385 - row * 67) - 320) / 640) * 8;
      y = ((165 - (55 + row * 48)) / 330) * 4.125;
      z = 0;
      if (i > count * 0.12) {
        x = 20;
        y = 20;
      }
    }
    targets[i * 3] = x;
    targets[i * 3 + 1] = y;
    targets[i * 3 + 2] = z;
  }
  function requestDraw() {
    if (!frame && visible) frame = requestAnimationFrame(draw);
  }
  function draw(now: number) {
    frame = 0;
    if (!visible || !active || (!dirty && reduced())) return;
    if (now - last < (mobile ? 1000 / 30 : 1000 / 45) && !dirty) {
      requestDraw();
      return;
    }
    last = now;
    const target = active.querySelector('svg') || active;
    const bounds = target.getBoundingClientRect();
    const viewBox = target instanceof SVGSVGElement ? target.viewBox.baseVal : null;
    const scale = viewBox
      ? Math.min(bounds.width / viewBox.width, bounds.height / viewBox.height)
      : 1;
    const width = viewBox ? viewBox.width * scale : bounds.width;
    const height = viewBox ? viewBox.height * scale : bounds.height;
    const left = bounds.left + (bounds.width - width) / 2;
    const top = bounds.top + (bounds.height - height) / 2;
    const r = { left, top, width, height, bottom: top + height };
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = reduced() ? 0 : now / 1000;
    const position = geometry.getAttribute('position');
    for (let i = 0; i < count; i++) {
      setTarget(i, t);
      for (let a = 0; a < 3; a++) {
        const idx = i * 3 + a;
        positions[idx] += (targets[idx] - positions[idx]) * (reduced() ? 1 : 0.1);
      }
    }
    position.array.set(positions);
    position.needsUpdate = true;
    points.rotation.y = mode === 'hero' ? 0.15 : 0;
    lines.visible = mode === 'hero';
    if (lines.visible) {
      for (let i = 0; i < 240; i++) {
        const a = i % count;
        const b = (i + 21) % count;
        for (let k = 0; k < 3; k++) {
          linePositions[i * 6 + k] = positions[a * 3 + k];
          linePositions[i * 6 + 3 + k] = positions[b * 3 + k];
        }
      }
      lineGeometry.getAttribute('position').array.set(linePositions);
      lineGeometry.getAttribute('position').needsUpdate = true;
    }
    camera.aspect = r.width / r.height;
    camera.position.z = mode === 'hero' ? 8 : 4 / (Math.tan(Math.PI / 9) * camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setViewport(r.left, innerHeight - r.bottom, r.width, r.height);
    renderer.setScissor(
      Math.max(0, r.left),
      Math.max(0, innerHeight - r.bottom),
      Math.min(r.width, innerWidth - r.left),
      Math.min(r.height, innerHeight - r.top),
    );
    renderer.setScissorTest(true);
    renderer.render(scene, camera);
    dirty = false;
    if (!reduced()) requestDraw();
  }
  const onScroll = () => choose();
  const onVisibility = () => {
    visible = !document.hidden;
    dirty = true;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else requestDraw();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      resize();
      choose();
    },
    { passive: true },
  );
  document.addEventListener('motionchange', () => {
    dirty = true;
    requestDraw();
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(frame);
    canvas.remove();
    document.documentElement.classList.remove('graphics-ready');
  });
  resize();
  choose();
  document.documentElement.classList.add('graphics-ready');
  requestDraw();
  // Release GPU resources on navigation, while allowing browser back/forward cache restoration.
  window.addEventListener('pagehide', (e) => {
    if (!e.persisted) {
      cancelAnimationFrame(frame);
      geometry.dispose();
      lineGeometry.dispose();
      material.dispose();
      (lines.material as LineBasicMaterial).dispose();
      renderer.dispose();
    }
  });
}
