/**
 * WCAG 2.1 AAA Accessibility Engine
 * Native ARIA attributes, focus management, and keyboard navigation
 */
export class AccessibilityEngine {
  constructor() {
    this.focusStack = [];
    this.announcements = [];
    this.keyboardTraps = new Map();
    this.colorContrast = new Map();
    this.screenReaderMode = false;
    
    this.init();
  }

  init() {
    this.detectScreenReader();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAnnouncements();
    this.auditAccessibility();
  }

  detectScreenReader() {
    // Detect screen reader presence
    this.screenReaderMode = !!(
      navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack/i) ||
      window.speechSynthesis ||
      document.querySelector('[aria-live]')
    );

    if (this.screenReaderMode) {
      document.body.classList.add('screen-reader-mode');
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event);
    });

    // Skip links for keyboard users
    this.createSkipLinks();
  }

  createSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#terminal" class="skip-link">Skip to terminal</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
    
    // Style skip links
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 1000;
      }
      .skip-link {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
      }
      .skip-link:focus {
        position: static;
        width: auto;
        height: auto;
        left: auto;
        top: auto;
      }
    `;
    document.head.appendChild(style);
  }

  handleKeyboardNavigation(event) {
    const { key, ctrlKey, altKey, shiftKey } = event;
    
    // Handle focus traps
    if (key === 'Tab') {
      this.handleTabNavigation(event);
    }
    
    // Custom keyboard shortcuts
    if (ctrlKey) {
      switch (key) {
        case 'h':
          event.preventDefault();
          this.announceHeadings();
          break;
        case 'l':
          event.preventDefault();
          this.announceLinks();
          break;
        case 'r':
          event.preventDefault();
          this.announceRegions();
          break;
      }
    }

    // Arrow key navigation for custom components
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.handleArrowNavigation(event);
    }
  }

  handleTabNavigation(event) {
    const activeElement = document.activeElement;
    const trap = this.findActiveTrap(activeElement);
    
    if (trap) {
      const focusableElements = this.getFocusableElements(trap.element);
      const currentIndex = focusableElements.indexOf(activeElement);
      
      if (event.shiftKey) {
        // Shift+Tab (backward)
        if (currentIndex === 0) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
      } else {
        // Tab (forward)
        if (currentIndex === focusableElements.length - 1) {
          event.preventDefault();
          focusableElements[0].focus();
        }
      }
    }
  }

  handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    const role = activeElement.getAttribute('role');
    
    if (['menu', 'menubar', 'listbox', 'tree', 'grid'].includes(role)) {
      event.preventDefault();
      this.navigateByRole(activeElement, event.key, role);
    }
  }

  navigateByRole(element, key, role) {
    const container = element.closest(`[role="${role}"]`) || element;
    const items = container.querySelectorAll('[role="menuitem"], [role="option"], [role="treeitem"], [role="gridcell"]');
    const currentIndex = Array.from(items).indexOf(element);
    
    let nextIndex = currentIndex;
    
    switch (key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        if (role === 'menubar') {
          nextIndex = (currentIndex + 1) % items.length;
        }
        break;
      case 'ArrowLeft':
        if (role === 'menubar') {
          nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        }
        break;
    }
    
    if (items[nextIndex]) {
      items[nextIndex].focus();
    }
  }

  setupFocusManagement() {
    // Track focus changes
    document.addEventListener('focusin', (event) => {
      this.onFocusChange(event.target);
    });

    // Restore focus on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.focusStack.length > 0) {
        const lastFocus = this.focusStack[this.focusStack.length - 1];
        if (lastFocus && document.contains(lastFocus)) {
          lastFocus.focus();
        }
      }
    });
  }

  onFocusChange(element) {
    // Update focus stack
    this.focusStack.push(element);
    if (this.focusStack.length > 10) {
      this.focusStack = this.focusStack.slice(-10);
    }

    // Announce focus changes for screen readers
    if (this.screenReaderMode) {
      this.announceFocusChange(element);
    }
  }

  announceFocusChange(element) {
    const label = this.getAccessibleLabel(element);
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    
    if (label) {
      this.announce(`${label}, ${role}`);
    }
  }

  setupAnnouncements() {
    // Create live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(this.liveRegion);

    // Create assertive live region for urgent announcements
    this.assertiveRegion = this.liveRegion.cloneNode();
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message, priority = 'polite') {
    const region = priority === 'assertive' ? this.assertiveRegion : this.liveRegion;
    
    // Clear previous announcement
    region.textContent = '';
    
    // Add new announcement after a brief delay
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Track announcements
    this.announcements.push({
      message,
      priority,
      timestamp: Date.now()
    });

    // Limit announcement history
    if (this.announcements.length > 50) {
      this.announcements = this.announcements.slice(-25);
    }
  }

  // Focus trap management
  createFocusTrap(element, options = {}) {
    const trap = {
      element,
      active: true,
      returnFocus: options.returnFocus !== false,
      previousFocus: document.activeElement,
      ...options
    };

    this.keyboardTraps.set(element, trap);
    
    // Focus first focusable element
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return trap;
  }

  removeFocusTrap(element) {
    const trap = this.keyboardTraps.get(element);
    if (trap) {
      if (trap.returnFocus && trap.previousFocus && document.contains(trap.previousFocus)) {
        trap.previousFocus.focus();
      }
      this.keyboardTraps.delete(element);
    }
  }

  findActiveTrap(element) {
    for (const [trapElement, trap] of this.keyboardTraps) {
      if (trap.active && trapElement.contains(element)) {
        return trap;
      }
    }
    return null;
  }

  getFocusableElements(container) {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector))
      .filter(el => this.isVisible(el));
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  // Accessibility utilities
  getAccessibleLabel(element) {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') && 
           document.getElementById(element.getAttribute('aria-labelledby'))?.textContent ||
           element.getAttribute('title') ||
           element.textContent?.trim() ||
           element.getAttribute('alt') ||
           element.getAttribute('placeholder');
  }

  generateAltText(element) {
    if (element.tagName === 'IMG') {
      // Basic image description based on context
      const context = element.closest('figure, article, section');
      const caption = context?.querySelector('figcaption, .caption');
      
      if (caption) {
        return `Image: ${caption.textContent.trim()}`;
      }
      
      // Fallback based on filename
      const src = element.src;
      if (src) {
        const filename = src.split('/').pop().split('.')[0];
        return `Image: ${filename.replace(/[-_]/g, ' ')}`;
      }
    }
    
    return 'Decorative image';
  }

  // Color contrast checking
  checkColorContrast(element) {
    const style = window.getComputedStyle(element);
    const color = this.parseColor(style.color);
    const backgroundColor = this.parseColor(style.backgroundColor);
    
    if (color && backgroundColor) {
      const contrast = this.calculateContrast(color, backgroundColor);
      const level = this.getContrastLevel(contrast);
      
      this.colorContrast.set(element, {
        contrast,
        level,
        passes: level === 'AAA' || level === 'AA'
      });
      
      return { contrast, level };
    }
    
    return null;
  }

  parseColor(colorString) {
    const div = document.createElement('div');
    div.style.color = colorString;
    document.body.appendChild(div);
    
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    
    return null;
  }

  calculateContrast(color1, color2) {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  getLuminance(color) {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  getContrastLevel(contrast) {
    if (contrast >= 7) return 'AAA';
    if (contrast >= 4.5) return 'AA';
    if (contrast >= 3) return 'AA Large';
    return 'Fail';
  }

  // Accessibility audit
  auditAccessibility() {
    const issues = [];
    
    // Check for missing alt text
    document.querySelectorAll('img:not([alt])').forEach(img => {
      issues.push({
        element: img,
        type: 'missing-alt',
        severity: 'error',
        message: 'Image missing alt attribute'
      });
    });

    // Check for empty headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      if (!heading.textContent.trim()) {
        issues.push({
          element: heading,
          type: 'empty-heading',
          severity: 'error',
          message: 'Heading element is empty'
        });
      }
    });

    // Check for missing form labels
    document.querySelectorAll('input, select, textarea').forEach(input => {
      if (!this.getAccessibleLabel(input)) {
        issues.push({
          element: input,
          type: 'missing-label',
          severity: 'error',
          message: 'Form control missing accessible label'
        });
      }
    });

    // Check color contrast
    document.querySelectorAll('*').forEach(element => {
      const contrast = this.checkColorContrast(element);
      if (contrast && !contrast.passes) {
        issues.push({
          element,
          type: 'color-contrast',
          severity: 'warning',
          message: `Color contrast ratio ${contrast.contrast.toFixed(2)} does not meet WCAG standards`
        });
      }
    });

    return issues;
  }

  // Announcement helpers
  announceHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingList = Array.from(headings).map(h => 
      `${h.tagName} ${h.textContent.trim()}`
    ).join(', ');
    
    this.announce(`Page headings: ${headingList}`);
  }

  announceLinks() {
    const links = document.querySelectorAll('a[href]');
    const linkList = Array.from(links).slice(0, 10).map(link => 
      link.textContent.trim() || link.href
    ).join(', ');
    
    this.announce(`Page links: ${linkList}`);
  }

  announceRegions() {
    const regions = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
    const regionList = Array.from(regions).map(region => 
      region.getAttribute('aria-label') || 
      region.getAttribute('role') || 
      region.tagName.toLowerCase()
    ).join(', ');
    
    this.announce(`Page regions: ${regionList}`);
  }

  // Public API
  getStats() {
    return {
      screenReaderMode: this.screenReaderMode,
      focusStackSize: this.focusStack.length,
      activeTraps: this.keyboardTraps.size,
      announcements: this.announcements.length,
      contrastChecks: this.colorContrast.size
    };
  }

  getAuditResults() {
    return this.auditAccessibility();
  }
}