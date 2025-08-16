// Enhanced Touch Navigation System for Mobile BIOS
export class EnhancedTouchNavigation {
  constructor(container) {
    this.container = container;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
    this.momentum = { velocity: 0, amplitude: 0, target: 0 };
    this.scrollPosition = 0;
    this.maxScroll = 0;
    this.animationId = null;
    
    this.setupTouchHandlers();
    this.setupScrollIndicators();
  }

  setupTouchHandlers() {
    // Use passive listeners for better performance and native scroll
    const passiveOptions = { passive: true };
    const activeOptions = { passive: false };
    
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), passiveOptions);
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), activeOptions);
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), passiveOptions);
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
    this.isScrolling = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  handleTouchMove(e) {
    if (!e.touches[0]) return;
    
    const deltaY = e.touches[0].clientY - this.touchStartY;
    const deltaX = e.touches[0].clientX - this.touchStartX;
    
    // Only handle horizontal swipes for navigation, let vertical scroll be native
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      // This is a horizontal swipe - prevent default for navigation
      const scrollableElement = this.getScrollableParent(e.target);
      if (!scrollableElement || scrollableElement.scrollHeight <= scrollableElement.clientHeight) {
        e.preventDefault();
        this.isScrolling = false; // This is navigation, not scrolling
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      // This is vertical scroll - let it be handled natively
      this.isScrolling = true;
      // Don't prevent default - allow native scrolling
    }
  }

  handleTouchEnd(e) {
    // Reset scroll state - native scrolling handles momentum
    this.isScrolling = false;
    
    // Handle swipe gestures for navigation
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.handleSwipeRight();
      } else {
        this.handleSwipeLeft();
      }
    }
  }

  getScrollableParent(element) {
    const scrollableSelectors = ['.bios-menu', '.detail-content', '.github-content-scroll', '.scrollable'];
    
    while (element && element !== document.body) {
      if (element.matches) {
        for (const selector of scrollableSelectors) {
          if (element.matches(selector)) {
            return element;
          }
        }
        // Check if element has overflow scroll
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
          return element;
        }
      }
      element = element.parentElement;
    }
    return null;
  }

  // Remove custom scrolling - let native handle it
  // scrollWithMomentum and applyMomentumScrolling removed to prevent conflicts

  setupScrollIndicators() {
    const scrollableElements = document.querySelectorAll('.bios-menu, .detail-content, .github-content-scroll, .scrollable');
    
    scrollableElements.forEach(element => {
      this.createScrollIndicator(element);
    });
  }

  createScrollIndicator(element) {
    // Remove existing indicator to prevent duplicates
    const existingIndicator = element.querySelector('.touch-scroll-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'touch-scroll-indicator';
    indicator.style.cssText = `
      position: absolute;
      right: 4px;
      top: 10px;
      width: 4px;
      height: 30px;
      background: rgba(3, 218, 198, 0.7);
      border-radius: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 100;
    `;
    
    // Ensure parent has relative positioning
    if (window.getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    element.appendChild(indicator);
    
    // Show indicator on scroll with throttling
    let scrollTimeout;
    element.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      this.updateScrollIndicator(element, element.scrollTop / Math.max(1, element.scrollHeight - element.clientHeight));
      
      scrollTimeout = setTimeout(() => {
        indicator.style.opacity = '0';
      }, 1500);
    }, { passive: true });
  }

  updateScrollIndicator(element, progress) {
    const indicator = element.querySelector('.touch-scroll-indicator');
    if (!indicator) return;
    
    const indicatorHeight = 30;
    const maxTop = element.clientHeight - indicatorHeight - 10;
    const isScrollable = element.scrollHeight > element.clientHeight;
    
    if (isScrollable) {
      indicator.style.top = `${10 + (progress * maxTop)}px`;
      indicator.style.opacity = '0.7';
    } else {
      indicator.style.opacity = '0';
    }
  }

  // Swipe navigation is now handled in handleTouchEnd
  setupSwipeNavigation() {
    // Swipe navigation integrated into main touch handlers
    // This prevents duplicate event listeners
  }

  handleSwipeRight() {
    // Navigate back if in detail view
    const backBtn = document.querySelector('.back-btn');
    if (backBtn && backBtn.offsetParent !== null) {
      backBtn.click();
    }
  }

  handleSwipeLeft() {
    // Could implement forward navigation if needed
  }

  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Remove event listeners with proper binding
    this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Remove scroll indicators
    const indicators = this.container.querySelectorAll('.touch-scroll-indicator');
    indicators.forEach(indicator => indicator.remove());
  }
}