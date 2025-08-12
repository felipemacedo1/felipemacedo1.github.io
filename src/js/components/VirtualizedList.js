/**
 * Virtual Scrolling Component
 * Manual DOM recycling with requestAnimationFrame optimization
 */
export class VirtualizedList {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemHeight: options.itemHeight || 50,
      bufferSize: options.bufferSize || 5,
      renderItem: options.renderItem || this.defaultRenderItem,
      getItemKey: options.getItemKey || ((item, index) => index),
      ...options
    };

    this.data = [];
    this.visibleRange = { start: 0, end: 0 };
    this.renderedNodes = new Map();
    this.nodePool = [];
    this.scrollTop = 0;
    this.containerHeight = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;

    this.init();
  }

  init() {
    this.setupContainer();
    this.bindEvents();
    this.updateDimensions();
  }

  setupContainer() {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';

    // Create viewport
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'relative';
    this.container.appendChild(this.viewport);

    // Create spacer for total height
    this.spacer = document.createElement('div');
    this.spacer.style.position = 'absolute';
    this.spacer.style.top = '0';
    this.spacer.style.left = '0';
    this.spacer.style.right = '0';
    this.spacer.style.pointerEvents = 'none';
    this.viewport.appendChild(this.spacer);
  }

  bindEvents() {
    let ticking = false;

    this.container.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Throttled resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateDimensions();
        this.render();
      }, 100);
    });
  }

  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.isScrolling = true;

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150);

    this.updateVisibleRange();
    this.render();
  }

  updateDimensions() {
    this.containerHeight = this.container.clientHeight;
  }

  setData(data) {
    this.data = data;
    this.updateTotalHeight();
    this.updateVisibleRange();
    this.render();
  }

  updateTotalHeight() {
    const totalHeight = this.data.length * this.options.itemHeight;
    this.spacer.style.height = `${totalHeight}px`;
  }

  updateVisibleRange() {
    const { itemHeight, bufferSize } = this.options;
    
    const startIndex = Math.floor(this.scrollTop / itemHeight);
    const endIndex = Math.min(
      this.data.length - 1,
      Math.ceil((this.scrollTop + this.containerHeight) / itemHeight)
    );

    this.visibleRange = {
      start: Math.max(0, startIndex - bufferSize),
      end: Math.min(this.data.length - 1, endIndex + bufferSize)
    };
  }

  render() {
    const { start, end } = this.visibleRange;
    const newKeys = new Set();

    // Render visible items
    for (let i = start; i <= end; i++) {
      const item = this.data[i];
      const key = this.options.getItemKey(item, i);
      newKeys.add(key);

      if (!this.renderedNodes.has(key)) {
        const node = this.createItemNode(item, i, key);
        this.renderedNodes.set(key, node);
        this.viewport.appendChild(node);
      } else {
        // Update existing node position
        const node = this.renderedNodes.get(key);
        this.updateNodePosition(node, i);
      }
    }

    // Remove nodes that are no longer visible
    for (const [key, node] of this.renderedNodes) {
      if (!newKeys.has(key)) {
        this.recycleNode(node);
        this.renderedNodes.delete(key);
      }
    }
  }

  createItemNode(item, index, key) {
    let node = this.getNodeFromPool();
    
    if (!node) {
      node = document.createElement('div');
      node.style.position = 'absolute';
      node.style.left = '0';
      node.style.right = '0';
      node.style.height = `${this.options.itemHeight}px`;
    }

    // Render item content
    this.options.renderItem(node, item, index);
    
    // Set position
    this.updateNodePosition(node, index);
    
    // Store metadata
    node._virtualIndex = index;
    node._virtualKey = key;

    return node;
  }

  updateNodePosition(node, index) {
    const top = index * this.options.itemHeight;
    node.style.transform = `translateY(${top}px)`;
  }

  getNodeFromPool() {
    return this.nodePool.pop() || null;
  }

  recycleNode(node) {
    // Clean up node
    node.innerHTML = '';
    node._virtualIndex = null;
    node._virtualKey = null;
    
    // Remove from DOM
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    // Add to pool for reuse
    this.nodePool.push(node);
  }

  defaultRenderItem(node, item, index) {
    node.textContent = typeof item === 'string' ? item : JSON.stringify(item);
  }

  // Public API methods
  scrollToIndex(index, behavior = 'smooth') {
    const targetScrollTop = index * this.options.itemHeight;
    this.container.scrollTo({
      top: targetScrollTop,
      behavior
    });
  }

  scrollToTop(behavior = 'smooth') {
    this.container.scrollTo({
      top: 0,
      behavior
    });
  }

  scrollToBottom(behavior = 'smooth') {
    const totalHeight = this.data.length * this.options.itemHeight;
    this.container.scrollTo({
      top: totalHeight - this.containerHeight,
      behavior
    });
  }

  getVisibleItems() {
    const { start, end } = this.visibleRange;
    return this.data.slice(start, end + 1);
  }

  getStats() {
    return {
      totalItems: this.data.length,
      visibleRange: this.visibleRange,
      renderedNodes: this.renderedNodes.size,
      pooledNodes: this.nodePool.length,
      isScrolling: this.isScrolling,
      scrollTop: this.scrollTop
    };
  }

  destroy() {
    // Clean up event listeners
    this.container.removeEventListener('scroll', this.handleScroll);
    
    // Clear timeouts
    clearTimeout(this.scrollTimeout);
    
    // Clean up DOM
    this.renderedNodes.clear();
    this.nodePool = [];
    
    if (this.viewport && this.viewport.parentNode) {
      this.viewport.parentNode.removeChild(this.viewport);
    }
  }
}