/**
 * Gesture Recognition System
 * Raw touch/mouse event tracking with pattern matching
 */
export class GestureRecognizer {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      swipeThreshold: options.swipeThreshold || 50,
      tapTimeout: options.tapTimeout || 300,
      doubleTapTimeout: options.doubleTapTimeout || 400,
      longPressTimeout: options.longPressTimeout || 500,
      pinchThreshold: options.pinchThreshold || 10,
      ...options
    };

    this.gestures = new Map();
    this.activePointers = new Map();
    this.gestureHistory = [];
    this.isTracking = false;
    this.lastTap = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.registerDefaultGestures();
  }

  bindEvents() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));

    // Mouse events (for desktop testing)
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => {
      if (this.isTracking) {
        e.preventDefault();
      }
    });
  }

  registerDefaultGestures() {
    // Swipe gestures
    this.registerGesture('swipe-left', this.detectSwipeLeft.bind(this));
    this.registerGesture('swipe-right', this.detectSwipeRight.bind(this));
    this.registerGesture('swipe-up', this.detectSwipeUp.bind(this));
    this.registerGesture('swipe-down', this.detectSwipeDown.bind(this));

    // Tap gestures
    this.registerGesture('tap', this.detectTap.bind(this));
    this.registerGesture('double-tap', this.detectDoubleTap.bind(this));
    this.registerGesture('long-press', this.detectLongPress.bind(this));

    // Multi-touch gestures
    this.registerGesture('pinch', this.detectPinch.bind(this));
    this.registerGesture('rotate', this.detectRotate.bind(this));
  }

  registerGesture(name, detector) {
    this.gestures.set(name, detector);
  }

  handleTouchStart(event) {
    this.isTracking = true;
    
    for (const touch of event.changedTouches) {
      this.activePointers.set(touch.identifier, {
        id: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startTime: Date.now(),
        path: [{ x: touch.clientX, y: touch.clientY, time: Date.now() }]
      });
    }

    this.startGestureDetection();
  }

  handleTouchMove(event) {
    if (!this.isTracking) return;

    for (const touch of event.changedTouches) {
      const pointer = this.activePointers.get(touch.identifier);
      if (pointer) {
        pointer.currentX = touch.clientX;
        pointer.currentY = touch.clientY;
        pointer.path.push({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
      }
    }

    this.updateGestureDetection();
  }

  handleTouchEnd(event) {
    for (const touch of event.changedTouches) {
      const pointer = this.activePointers.get(touch.identifier);
      if (pointer) {
        pointer.endTime = Date.now();
        this.finalizeGestureDetection(pointer);
        this.activePointers.delete(touch.identifier);
      }
    }

    if (this.activePointers.size === 0) {
      this.isTracking = false;
    }
  }

  handleTouchCancel(event) {
    for (const touch of event.changedTouches) {
      this.activePointers.delete(touch.identifier);
    }
    this.isTracking = false;
  }

  // Mouse event handlers (for desktop testing)
  handleMouseDown(event) {
    this.isTracking = true;
    this.activePointers.set('mouse', {
      id: 'mouse',
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: Date.now(),
      path: [{ x: event.clientX, y: event.clientY, time: Date.now() }]
    });
    this.startGestureDetection();
  }

  handleMouseMove(event) {
    if (!this.isTracking) return;
    
    const pointer = this.activePointers.get('mouse');
    if (pointer) {
      pointer.currentX = event.clientX;
      pointer.currentY = event.clientY;
      pointer.path.push({
        x: event.clientX,
        y: event.clientY,
        time: Date.now()
      });
    }
    this.updateGestureDetection();
  }

  handleMouseUp(event) {
    const pointer = this.activePointers.get('mouse');
    if (pointer) {
      pointer.endTime = Date.now();
      this.finalizeGestureDetection(pointer);
      this.activePointers.delete('mouse');
    }
    this.isTracking = false;
  }

  handleMouseLeave() {
    this.activePointers.clear();
    this.isTracking = false;
  }

  startGestureDetection() {
    // Start long press timer for single pointer
    if (this.activePointers.size === 1) {
      this.longPressTimer = setTimeout(() => {
        const pointer = Array.from(this.activePointers.values())[0];
        if (this.detectLongPress(pointer)) {
          this.emitGesture('long-press', { pointer });
        }
      }, this.options.longPressTimeout);
    }
  }

  updateGestureDetection() {
    // Clear long press if pointer moves too much
    if (this.longPressTimer && this.activePointers.size === 1) {
      const pointer = Array.from(this.activePointers.values())[0];
      const distance = this.calculateDistance(
        pointer.startX, pointer.startY,
        pointer.currentX, pointer.currentY
      );
      
      if (distance > 10) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }

    // Detect multi-touch gestures
    if (this.activePointers.size === 2) {
      const pointers = Array.from(this.activePointers.values());
      
      if (this.detectPinch(pointers)) {
        this.emitGesture('pinch', { pointers });
      }
      
      if (this.detectRotate(pointers)) {
        this.emitGesture('rotate', { pointers });
      }
    }
  }

  finalizeGestureDetection(pointer) {
    clearTimeout(this.longPressTimer);

    // Detect completed gestures
    for (const [name, detector] of this.gestures) {
      if (detector(pointer)) {
        this.emitGesture(name, { pointer });
        break; // Only emit first matching gesture
      }
    }
  }

  // Gesture detection methods
  detectSwipeLeft(pointer) {
    const deltaX = pointer.currentX - pointer.startX;
    const deltaY = Math.abs(pointer.currentY - pointer.startY);
    return deltaX < -this.options.swipeThreshold && deltaY < this.options.swipeThreshold;
  }

  detectSwipeRight(pointer) {
    const deltaX = pointer.currentX - pointer.startX;
    const deltaY = Math.abs(pointer.currentY - pointer.startY);
    return deltaX > this.options.swipeThreshold && deltaY < this.options.swipeThreshold;
  }

  detectSwipeUp(pointer) {
    const deltaY = pointer.currentY - pointer.startY;
    const deltaX = Math.abs(pointer.currentX - pointer.startX);
    return deltaY < -this.options.swipeThreshold && deltaX < this.options.swipeThreshold;
  }

  detectSwipeDown(pointer) {
    const deltaY = pointer.currentY - pointer.startY;
    const deltaX = Math.abs(pointer.currentX - pointer.startX);
    return deltaY > this.options.swipeThreshold && deltaX < this.options.swipeThreshold;
  }

  detectTap(pointer) {
    const distance = this.calculateDistance(
      pointer.startX, pointer.startY,
      pointer.currentX, pointer.currentY
    );
    const duration = pointer.endTime - pointer.startTime;
    
    return distance < 10 && duration < this.options.tapTimeout;
  }

  detectDoubleTap(pointer) {
    if (!this.detectTap(pointer)) return false;

    const now = Date.now();
    if (this.lastTap && (now - this.lastTap.time) < this.options.doubleTapTimeout) {
      const distance = this.calculateDistance(
        this.lastTap.x, this.lastTap.y,
        pointer.startX, pointer.startY
      );
      
      if (distance < 30) {
        this.lastTap = null; // Prevent triple tap
        return true;
      }
    }

    this.lastTap = {
      x: pointer.startX,
      y: pointer.startY,
      time: now
    };
    
    return false;
  }

  detectLongPress(pointer) {
    const distance = this.calculateDistance(
      pointer.startX, pointer.startY,
      pointer.currentX, pointer.currentY
    );
    const duration = Date.now() - pointer.startTime;
    
    return distance < 10 && duration >= this.options.longPressTimeout;
  }

  detectPinch(pointers) {
    if (pointers.length !== 2) return false;

    const [p1, p2] = pointers;
    const currentDistance = this.calculateDistance(
      p1.currentX, p1.currentY,
      p2.currentX, p2.currentY
    );
    const startDistance = this.calculateDistance(
      p1.startX, p1.startY,
      p2.startX, p2.startY
    );

    return Math.abs(currentDistance - startDistance) > this.options.pinchThreshold;
  }

  detectRotate(pointers) {
    if (pointers.length !== 2) return false;

    const [p1, p2] = pointers;
    const startAngle = this.calculateAngle(p1.startX, p1.startY, p2.startX, p2.startY);
    const currentAngle = this.calculateAngle(p1.currentX, p1.currentY, p2.currentX, p2.currentY);
    
    return Math.abs(currentAngle - startAngle) > 15; // 15 degrees threshold
  }

  // Utility methods
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  calculateAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }

  emitGesture(name, data) {
    const event = new CustomEvent(`gesture:${name}`, {
      detail: {
        ...data,
        timestamp: Date.now(),
        element: this.element
      }
    });

    this.element.dispatchEvent(event);
    
    // Add to history
    this.gestureHistory.push({
      name,
      timestamp: Date.now(),
      data
    });

    // Limit history size
    if (this.gestureHistory.length > 100) {
      this.gestureHistory = this.gestureHistory.slice(-50);
    }
  }

  // Public API
  on(gestureType, callback) {
    this.element.addEventListener(`gesture:${gestureType}`, callback);
  }

  off(gestureType, callback) {
    this.element.removeEventListener(`gesture:${gestureType}`, callback);
  }

  getHistory() {
    return [...this.gestureHistory];
  }

  getStats() {
    const stats = {};
    this.gestureHistory.forEach(gesture => {
      stats[gesture.name] = (stats[gesture.name] || 0) + 1;
    });
    
    return {
      totalGestures: this.gestureHistory.length,
      gestureTypes: Object.keys(stats).length,
      breakdown: stats,
      activePointers: this.activePointers.size,
      isTracking: this.isTracking
    };
  }

  destroy() {
    clearTimeout(this.longPressTimer);
    this.activePointers.clear();
    this.gestureHistory = [];
    this.isTracking = false;
  }
}