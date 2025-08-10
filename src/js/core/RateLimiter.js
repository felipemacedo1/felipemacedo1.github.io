/**
 * Enterprise Rate Limiter
 * Implements sliding window + token bucket algorithm
 */
export class RateLimiter {
  constructor() {
    this.windows = new Map(); // clientKey -> { timestamps: [], tokens: number }
    this.config = {
      windowSize: 60000, // 1 minute
      maxRequests: 60,
      tokenRefillRate: 1, // tokens per second
      maxTokens: 10
    };
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      clients: new Set()
    };
    
    this.startTokenRefill();
  }

  isAllowed(clientKey = 'default', cost = 1) {
    const now = Date.now();
    this.metrics.totalRequests++;
    this.metrics.clients.add(clientKey);

    if (!this.windows.has(clientKey)) {
      this.windows.set(clientKey, {
        timestamps: [],
        tokens: this.config.maxTokens,
        lastRefill: now
      });
    }

    const window = this.windows.get(clientKey);
    
    // Sliding window check
    window.timestamps = window.timestamps.filter(
      timestamp => now - timestamp < this.config.windowSize
    );

    if (window.timestamps.length >= this.config.maxRequests) {
      this.metrics.blockedRequests++;
      return { allowed: false, reason: 'rate_limit_exceeded' };
    }

    // Token bucket check
    if (window.tokens < cost) {
      this.metrics.blockedRequests++;
      return { allowed: false, reason: 'insufficient_tokens' };
    }

    // Allow request
    window.timestamps.push(now);
    window.tokens -= cost;
    
    return { 
      allowed: true, 
      remaining: this.config.maxRequests - window.timestamps.length,
      tokens: window.tokens
    };
  }

  startTokenRefill() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [clientKey, window] of this.windows) {
        const timeSinceRefill = now - window.lastRefill;
        const tokensToAdd = Math.floor(timeSinceRefill / 1000) * this.config.tokenRefillRate;
        
        if (tokensToAdd > 0) {
          window.tokens = Math.min(this.config.maxTokens, window.tokens + tokensToAdd);
          window.lastRefill = now;
        }
      }
    }, 1000);
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeClients: this.windows.size,
      successRate: this.metrics.totalRequests > 0 
        ? ((this.metrics.totalRequests - this.metrics.blockedRequests) / this.metrics.totalRequests * 100).toFixed(2)
        : 100
    };
  }

  reset(clientKey) {
    if (clientKey) {
      this.windows.delete(clientKey);
    } else {
      this.windows.clear();
      this.metrics = {
        totalRequests: 0,
        blockedRequests: 0,
        clients: new Set()
      };
    }
  }
}