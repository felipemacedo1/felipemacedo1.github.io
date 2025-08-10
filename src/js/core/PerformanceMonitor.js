/**
 * Enterprise Performance Monitor
 * Uses Performance API, PerformanceObserver, and custom metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      fcp: 1800, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      fid: 100,  // First Input Delay
      cls: 0.1,  // Cumulative Layout Shift
      ttfb: 800  // Time to First Byte
    };
    
    this.init();
  }

  init() {
    this.setupPerformanceObservers();
    this.trackCustomMetrics();
    this.setupErrorBoundary();
  }

  setupPerformanceObservers() {
    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      this.createObserver('largest-contentful-paint', (entries) => {
        const lcp = entries[entries.length - 1];
        this.recordMetric('lcp', lcp.startTime, {
          element: lcp.element?.tagName,
          url: lcp.url
        });
      });

      // First Input Delay
      this.createObserver('first-input', (entries) => {
        const fid = entries[0];
        this.recordMetric('fid', fid.processingStart - fid.startTime, {
          eventType: fid.name
        });
      });

      // Cumulative Layout Shift
      this.createObserver('layout-shift', (entries) => {
        let clsValue = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (clsValue > 0) {
          this.recordMetric('cls', clsValue);
        }
      });

      // Navigation timing
      this.createObserver('navigation', (entries) => {
        const nav = entries[0];
        this.recordMetric('ttfb', nav.responseStart - nav.requestStart);
        this.recordMetric('domContentLoaded', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart);
        this.recordMetric('loadComplete', nav.loadEventEnd - nav.loadEventStart);
      });

      // Resource timing
      this.createObserver('resource', (entries) => {
        entries.forEach(entry => {
          this.recordResourceMetric(entry);
        });
      });
    }

    // First Contentful Paint (fallback)
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime);
        }
      });
    }
  }

  createObserver(type, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to create observer for ${type}:`, error);
    }
  }

  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: performance.now(),
      metadata,
      isGood: this.evaluateMetric(name, value)
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name);
    metrics.push(metric);

    // Keep only last 100 entries per metric
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }

    // Emit event for real-time monitoring
    this.emit('metric-recorded', metric);
  }

  recordResourceMetric(entry) {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;
    
    this.recordMetric(`resource-${resourceType}`, loadTime, {
      url: entry.name,
      size: entry.transferSize,
      cached: entry.transferSize === 0
    });
  }

  getResourceType(url) {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.css$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  evaluateMetric(name, value) {
    const threshold = this.thresholds[name];
    if (!threshold) return true;

    switch (name) {
      case 'cls':
        return value <= threshold;
      default:
        return value <= threshold;
    }
  }

  trackCustomMetrics() {
    // Terminal-specific metrics
    this.startTime = performance.now();
    
    // Track command execution time
    window.addEventListener('command-executed', (event) => {
      this.recordMetric('command-execution', event.detail.duration, {
        command: event.detail.command
      });
    });

    // Track memory usage
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMetric('memory-used', performance.memory.usedJSHeapSize);
        this.recordMetric('memory-total', performance.memory.totalJSHeapSize);
      }, 30000); // Every 30 seconds
    }

    // Track frame rate
    this.trackFrameRate();
  }

  trackFrameRate() {
    let frames = 0;
    let lastTime = performance.now();

    const countFrame = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.recordMetric('fps', frames);
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  setupErrorBoundary() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordMetric('js-error', 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('promise-rejection', 1, {
        reason: event.reason?.toString()
      });
    });
  }

  // Timing utilities
  startTiming(label) {
    performance.mark(`${label}-start`);
    return {
      end: () => {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label, 'measure')[0];
        this.recordMetric(`timing-${label}`, measure.duration);
        
        // Cleanup
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
        
        return measure.duration;
      }
    };
  }

  // Analytics and reporting
  getMetricSummary(name) {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      name,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      latest: metrics[metrics.length - 1].value,
      isGood: metrics[metrics.length - 1].isGood
    };
  }

  getAllMetrics() {
    const summary = {};
    for (const name of this.metrics.keys()) {
      summary[name] = this.getMetricSummary(name);
    }
    return summary;
  }

  getPerformanceScore() {
    const coreMetrics = ['fcp', 'lcp', 'fid', 'cls'];
    let score = 0;
    let validMetrics = 0;

    coreMetrics.forEach(metric => {
      const summary = this.getMetricSummary(metric);
      if (summary && summary.isGood !== undefined) {
        score += summary.isGood ? 25 : 0;
        validMetrics++;
      }
    });

    return validMetrics > 0 ? Math.round(score / validMetrics * 4) : 0; // Scale to 100
  }

  exportMetrics() {
    const data = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getAllMetrics(),
      score: this.getPerformanceScore()
    };

    return JSON.stringify(data, null, 2);
  }

  // Event emitter
  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`performance:${event}`, { detail: data }));
    }
  }

  // Cleanup
  disconnect() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }
}