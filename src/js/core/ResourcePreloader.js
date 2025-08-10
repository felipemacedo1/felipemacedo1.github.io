/**
 * Predictive Resource Preloader
 * ML-style prediction using weighted click history
 */
export class ResourcePreloader {
  constructor(options = {}) {
    this.options = {
      maxHistorySize: options.maxHistorySize || 1000,
      predictionThreshold: options.predictionThreshold || 0.3,
      maxPreloadConcurrency: options.maxPreloadConcurrency || 3,
      decayFactor: options.decayFactor || 0.95,
      ...options
    };

    this.clickHistory = [];
    this.resourceWeights = new Map();
    this.preloadedResources = new Set();
    this.activePreloads = new Map();
    this.sessionPatterns = new Map();
    this.currentSession = [];

    this.init();
  }

  init() {
    this.loadHistoryFromStorage();
    this.setupEventListeners();
    this.startPeriodicAnalysis();
  }

  setupEventListeners() {
    // Track user interactions
    document.addEventListener('click', (event) => {
      this.recordInteraction(event);
    });

    // Track page visibility for session management
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      } else {
        this.startSession();
      }
    });

    // Track resource load success/failure
    window.addEventListener('load', () => {
      this.updateResourceSuccess();
    });
  }

  recordInteraction(event) {
    const target = event.target;
    const interaction = {
      timestamp: Date.now(),
      element: this.getElementSignature(target),
      url: this.extractResourceUrl(target),
      context: this.getInteractionContext(),
      sessionId: this.getCurrentSessionId()
    };

    this.clickHistory.push(interaction);
    this.currentSession.push(interaction);

    // Limit history size
    if (this.clickHistory.length > this.options.maxHistorySize) {
      this.clickHistory = this.clickHistory.slice(-this.options.maxHistorySize);
    }

    // Update weights and make predictions
    this.updateWeights(interaction);
    this.makePredictions();
    
    // Save to storage periodically
    if (this.clickHistory.length % 10 === 0) {
      this.saveHistoryToStorage();
    }
  }

  getElementSignature(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const text = element.textContent ? element.textContent.slice(0, 20) : '';
    
    return `${tag}${id}${classes}[${text}]`;
  }

  extractResourceUrl(element) {
    if (element.href) return element.href;
    if (element.src) return element.src;
    if (element.dataset.url) return element.dataset.url;
    
    // Look for resource hints in parent elements
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (parent.dataset.preload) return parent.dataset.preload;
      parent = parent.parentElement;
    }

    return null;
  }

  getInteractionContext() {
    return {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      scrollPosition: window.scrollY,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userAgent: navigator.userAgent.slice(0, 50)
    };
  }

  getCurrentSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  updateWeights(interaction) {
    if (!interaction.url) return;

    const weight = this.calculateInteractionWeight(interaction);
    const currentWeight = this.resourceWeights.get(interaction.url) || 0;
    
    // Apply decay to existing weight and add new weight
    const newWeight = (currentWeight * this.options.decayFactor) + weight;
    this.resourceWeights.set(interaction.url, newWeight);

    // Update pattern recognition
    this.updatePatterns(interaction);
  }

  calculateInteractionWeight(interaction) {
    let weight = 1.0;

    // Time-based decay (recent interactions are more valuable)
    const ageInHours = (Date.now() - interaction.timestamp) / (1000 * 60 * 60);
    weight *= Math.exp(-ageInHours / 24); // Decay over 24 hours

    // Context-based weighting
    const context = interaction.context;
    
    // Time of day patterns
    const currentHour = new Date().getHours();
    if (Math.abs(currentHour - context.timeOfDay) <= 2) {
      weight *= 1.2; // Boost for similar time of day
    }

    // Day of week patterns
    const currentDay = new Date().getDay();
    if (currentDay === context.dayOfWeek) {
      weight *= 1.1; // Boost for same day of week
    }

    return weight;
  }

  updatePatterns(interaction) {
    const pattern = this.extractPattern(interaction);
    if (!pattern) return;

    const patternKey = JSON.stringify(pattern);
    const currentCount = this.sessionPatterns.get(patternKey) || 0;
    this.sessionPatterns.set(patternKey, currentCount + 1);
  }

  extractPattern(interaction) {
    if (this.currentSession.length < 2) return null;

    const recent = this.currentSession.slice(-3); // Last 3 interactions
    return {
      sequence: recent.map(i => i.element),
      timeGaps: recent.slice(1).map((curr, idx) => 
        curr.timestamp - recent[idx].timestamp
      ),
      context: interaction.context.timeOfDay
    };
  }

  makePredictions() {
    const predictions = [];

    // Weight-based predictions
    for (const [url, weight] of this.resourceWeights) {
      if (weight > this.options.predictionThreshold && !this.preloadedResources.has(url)) {
        predictions.push({
          url,
          confidence: Math.min(weight, 1.0),
          reason: 'weight-based'
        });
      }
    }

    // Pattern-based predictions
    const patternPredictions = this.getPatternPredictions();
    predictions.push(...patternPredictions);

    // Sort by confidence and preload top candidates
    predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.options.maxPreloadConcurrency)
      .forEach(prediction => this.preloadResource(prediction));
  }

  getPatternPredictions() {
    const predictions = [];
    const currentPattern = this.extractCurrentPattern();
    
    if (!currentPattern) return predictions;

    // Find similar patterns in history
    for (const [patternKey, count] of this.sessionPatterns) {
      if (count < 2) continue; // Need at least 2 occurrences
      
      try {
        const pattern = JSON.parse(patternKey);
        const similarity = this.calculatePatternSimilarity(currentPattern, pattern);
        
        if (similarity > 0.7) {
          // Predict next resource based on this pattern
          const nextResource = this.predictNextFromPattern(pattern);
          if (nextResource) {
            predictions.push({
              url: nextResource,
              confidence: similarity * (count / 10), // Normalize count
              reason: 'pattern-based'
            });
          }
        }
      } catch (e) {
        // Invalid pattern, skip
      }
    }

    return predictions;
  }

  extractCurrentPattern() {
    if (this.currentSession.length < 2) return null;
    
    const recent = this.currentSession.slice(-2);
    return {
      sequence: recent.map(i => i.element),
      timeGaps: [recent[1].timestamp - recent[0].timestamp],
      context: recent[recent.length - 1].context.timeOfDay
    };
  }

  calculatePatternSimilarity(pattern1, pattern2) {
    let similarity = 0;
    let factors = 0;

    // Sequence similarity
    const commonElements = pattern1.sequence.filter(el => 
      pattern2.sequence.includes(el)
    ).length;
    similarity += (commonElements / Math.max(pattern1.sequence.length, pattern2.sequence.length)) * 0.5;
    factors += 0.5;

    // Time gap similarity
    if (pattern1.timeGaps.length > 0 && pattern2.timeGaps.length > 0) {
      const avgGap1 = pattern1.timeGaps.reduce((a, b) => a + b) / pattern1.timeGaps.length;
      const avgGap2 = pattern2.timeGaps.reduce((a, b) => a + b) / pattern2.timeGaps.length;
      const gapSimilarity = 1 - Math.abs(avgGap1 - avgGap2) / Math.max(avgGap1, avgGap2);
      similarity += gapSimilarity * 0.3;
      factors += 0.3;
    }

    // Context similarity
    const contextSimilarity = Math.abs(pattern1.context - pattern2.context) <= 2 ? 1 : 0;
    similarity += contextSimilarity * 0.2;
    factors += 0.2;

    return factors > 0 ? similarity / factors : 0;
  }

  predictNextFromPattern(pattern) {
    // This is a simplified prediction - in a real ML system,
    // you'd use more sophisticated sequence prediction
    const lastElement = pattern.sequence[pattern.sequence.length - 1];
    
    // Find resources that commonly follow this element
    const followingResources = this.clickHistory
      .filter((interaction, idx) => {
        const prev = this.clickHistory[idx - 1];
        return prev && prev.element === lastElement && interaction.url;
      })
      .map(interaction => interaction.url);

    if (followingResources.length === 0) return null;

    // Return most common following resource
    const resourceCounts = {};
    followingResources.forEach(url => {
      resourceCounts[url] = (resourceCounts[url] || 0) + 1;
    });

    return Object.keys(resourceCounts).reduce((a, b) => 
      resourceCounts[a] > resourceCounts[b] ? a : b
    );
  }

  async preloadResource(prediction) {
    if (this.activePreloads.has(prediction.url)) return;
    if (this.preloadedResources.has(prediction.url)) return;

    this.activePreloads.set(prediction.url, prediction);

    try {
      await this.performPreload(prediction.url);
      this.preloadedResources.add(prediction.url);
      this.activePreloads.delete(prediction.url);
    } catch (error) {
      this.activePreloads.delete(prediction.url);
      console.warn('Preload failed:', prediction.url, error);
    }
  }

  async performPreload(url) {
    const link = document.createElement('link');
    
    // Determine preload type based on URL
    if (url.match(/\.(js|mjs)$/)) {
      link.rel = 'preload';
      link.as = 'script';
    } else if (url.match(/\.css$/)) {
      link.rel = 'preload';
      link.as = 'style';
    } else if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      link.rel = 'preload';
      link.as = 'image';
    } else {
      link.rel = 'prefetch';
    }

    link.href = url;
    link.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
      
      // Cleanup after 30 seconds
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 30000);
    });
  }

  startPeriodicAnalysis() {
    setInterval(() => {
      this.analyzeAndOptimize();
    }, 60000); // Every minute
  }

  analyzeAndOptimize() {
    // Remove old entries
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    this.clickHistory = this.clickHistory.filter(
      interaction => interaction.timestamp > cutoff
    );

    // Decay weights
    for (const [url, weight] of this.resourceWeights) {
      const newWeight = weight * this.options.decayFactor;
      if (newWeight < 0.01) {
        this.resourceWeights.delete(url);
      } else {
        this.resourceWeights.set(url, newWeight);
      }
    }

    // Clean up old preloaded resources
    this.cleanupPreloadedResources();
  }

  cleanupPreloadedResources() {
    // Remove resources that haven't been accessed recently
    const recentUrls = new Set(
      this.clickHistory
        .filter(i => Date.now() - i.timestamp < 24 * 60 * 60 * 1000)
        .map(i => i.url)
        .filter(Boolean)
    );

    for (const url of this.preloadedResources) {
      if (!recentUrls.has(url)) {
        this.preloadedResources.delete(url);
      }
    }
  }

  startSession() {
    this.sessionId = null;
    this.currentSession = [];
  }

  endSession() {
    if (this.currentSession.length > 0) {
      // Analyze session patterns
      this.analyzeSession(this.currentSession);
    }
    this.currentSession = [];
  }

  analyzeSession(session) {
    // Extract valuable patterns from completed session
    for (let i = 1; i < session.length; i++) {
      const pattern = {
        from: session[i - 1].element,
        to: session[i].element,
        timeGap: session[i].timestamp - session[i - 1].timestamp,
        context: session[i].context.timeOfDay
      };

      const patternKey = JSON.stringify(pattern);
      const count = this.sessionPatterns.get(patternKey) || 0;
      this.sessionPatterns.set(patternKey, count + 1);
    }
  }

  loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('preloader-history');
      if (stored) {
        const data = JSON.parse(stored);
        this.clickHistory = data.history || [];
        this.resourceWeights = new Map(data.weights || []);
        this.sessionPatterns = new Map(data.patterns || []);
      }
    } catch (error) {
      console.warn('Failed to load preloader history:', error);
    }
  }

  saveHistoryToStorage() {
    try {
      const data = {
        history: this.clickHistory.slice(-500), // Keep last 500 entries
        weights: Array.from(this.resourceWeights.entries()),
        patterns: Array.from(this.sessionPatterns.entries()).slice(-100)
      };
      localStorage.setItem('preloader-history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save preloader history:', error);
    }
  }

  getStats() {
    return {
      historySize: this.clickHistory.length,
      trackedResources: this.resourceWeights.size,
      preloadedResources: this.preloadedResources.size,
      activePreloads: this.activePreloads.size,
      sessionPatterns: this.sessionPatterns.size,
      currentSessionLength: this.currentSession.length,
      topResources: Array.from(this.resourceWeights.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([url, weight]) => ({ url, weight: weight.toFixed(3) }))
    };
  }
}