import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['notebook', 1280, 800],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
] as const) {
  test(`${name}: full page, anchors and overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Felipe Macedo');
    for (const id of [
      'value',
      'work',
      'open-speech-bridge',
      'database-radar',
      'rizoma',
      'legacy-flight-recorder',
      'journey',
      'education',
      'direction',
      'contact',
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
    }
    await expect(page.locator('.credential')).toHaveCount(6);
    await page.screenshot({ path: `test-results/${name}-full.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}
test('keyboard, reduced motion and language continuity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('header a[href="#education"]').click();
  await expect(page).toHaveURL(/#education$/);
  await page.locator('.languages a[lang="en"]').click();
  await expect(page).toHaveURL(/\/en\/#education$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('Understand the problem');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
test('content and navigation survive JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/');
  await expect(page.locator('h1')).toContainText('Felipe Macedo');
  await expect(page.locator('.credential')).toHaveCount(6);
  await page.locator('header a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await context.close();
});
test('GPU unavailable keeps diagrams and content usable', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/');
  await expect(page.locator('.graphics-canvas')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('.topology')).toBeVisible();
  await expect(page.locator('#work')).toContainText('OpenSpeechBridge');
});
test('default PT accessibility and local requests only', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4321')) external.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('#work')).toContainText('OpenSpeechBridge');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(external).toEqual([]);
});
test('optional terminal uses current source and safe text output', async ({ page }) => {
  await page.goto('/legacy/');
  await page.locator('input').fill('projects');
  await page.keyboard.press('Enter');
  await expect(page.locator('#output')).toContainText('Rizoma');
  await page.locator('input').fill('<img src=x onerror=alert(1)>');
  await page.keyboard.press('Enter');
  await expect(page.locator('#output img')).toHaveCount(0);
});
test('legacy mobile URL returns to the current portfolio', async ({ page }) => {
  await page.goto('/mobile.html');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Felipe Macedo');
});

test('canonical contacts, résumé and credentials routes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="mailto:felipealexandrej@gmail.com"]')).toBeVisible();
  await expect(page.locator('a[href="https://www.linkedin.com/in/felipemacedo1/"]')).toHaveCount(2);
  await expect(page.locator('body')).not.toContainText(['felipemacedo.dev', '@gmail.com'].join(''));
  await page.goto('/curriculo/');
  await expect(page.locator('object[data="/cv/Felipe-Macedo-CV-2026.pdf"]')).toBeVisible();
  await expect(page.locator('a[download="Felipe-Macedo-CV-2026.pdf"]')).toHaveCount(2);
  await page.goto('/en/resume/');
  await expect(page.locator('h1')).toContainText('Résumé');
  await page.goto('/credenciais/');
  await expect(page.locator('body')).toContainText('IA para Desenvolvimento de Software');
  await expect(page.locator('body')).toContainText('certificação profissional');
  await page.goto('/en/credentials/');
  await expect(page.locator('body')).toContainText('IA para Desenvolvimento de Software');
});

test('certificate details remain keyboard-accessible', async ({ page }) => {
  await page.goto('/credenciais/');
  const certificate = page.locator('.certificate-card').first();
  await certificate.locator('summary').focus();
  await expect(certificate.locator('summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(certificate.locator('.certificate-body img')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
