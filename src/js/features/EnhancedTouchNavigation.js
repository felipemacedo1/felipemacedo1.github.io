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
    const options = { passive: false };
    
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), options);
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), options);
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), options);
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
    
    // Determine scroll direction
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      this.isScrolling = true;
      e.preventDefault();
      
      const scrollableElement = this.getScrollableParent(e.target);
      if (scrollableElement) {
        this.scrollWithMomentum(scrollableElement, -deltaY);
      }
    }
  }

  handleTouchEnd(e) {
    if (this.isScrolling) {
      this.applyMomentumScrolling();
    }
  }

  getScrollableParent(element) {
    const scrollableSelectors = ['.bios-menu', '.detail-content', '.github-content-scroll'];
    
    while (element && element !== document.body) {
      for (const selector of scrollableSelectors) {
        if (element.matches && element.matches(selector)) {
          return element;
        }
      }
      element = element.parentElement;
    }
    return null;
  }

  scrollWithMomentum(element, delta) {
    const currentScroll = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    
    let newScroll = currentScroll + delta * 0.5;
    newScroll = Math.max(0, Math.min(newScroll, maxScroll));
    
    element.scrollTop = newScroll;
    this.updateScrollIndicator(element, newScroll / maxScroll);
  }

  applyMomentumScrolling() {
    // Simple momentum implementation
    this.momentum.velocity *= 0.95;
    
    if (Math.abs(this.momentum.velocity) > 0.5) {
      this.animationId = requestAnimationFrame(() => this.applyMomentumScrolling());
    }
  }

  setupScrollIndicators() {
    const scrollableElements = document.querySelectorAll('.bios-menu, .detail-content, .github-content-scroll');
    
    scrollableElements.forEach(element => {
      this.createScrollIndicator(element);
    });
  }

  createScrollIndicator(element) {
    const indicator = document.createElement('div');
    indicator.className = 'touch-scroll-indicator';
    indicator.style.cssText = `
      position: absolute;
      right: 4px;
      top: 10px;
      width: 6px;
      height: 40px;
      background: rgba(3, 218, 198, 0.6);
      border-radius: 3px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.appendChild(indicator);
    
    // Show indicator on scroll
    element.addEventListener('scroll', () => {
      this.updateScrollIndicator(element, element.scrollTop / (element.scrollHeight - element.clientHeight));
    }, { passive: true });
  }

  updateScrollIndicator(element, progress) {
    const indicator = element.querySelector('.touch-scroll-indicator');
    if (!indicator) return;
    
    const maxTop = element.clientHeight - 40;
    indicator.style.top = `${progress * maxTop}px`;
    indicator.style.opacity = element.scrollHeight > element.clientHeight ? '0.8' : '0';
    
    // Auto-hide after 2 seconds
    clearTimeout(indicator.hideTimeout);
    indicator.hideTimeout = setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }

  // Swipe gesture for navigation
  setupSwipeNavigation() {
    let startX = 0;
    let startY = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Horizontal swipe for navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      }
    }, { passive: true });
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
    
    // Remove event listeners
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
  }
}