/**
 * Immutable State Management
 * Deep clone and freeze with middleware chain
 */
export class StateManager {
  constructor(initialState = {}) {
    this.state = this.deepFreeze(this.deepClone(initialState));
    this.subscribers = new Set();
    this.middleware = [];
    this.history = [this.state];
    this.maxHistorySize = 50;
    this.currentIndex = 0;
  }

  getState() {
    return this.state;
  }

  setState(updater, meta = {}) {
    const prevState = this.state;
    let nextState;

    if (typeof updater === 'function') {
      nextState = updater(this.deepClone(prevState));
    } else {
      nextState = { ...this.deepClone(prevState), ...updater };
    }

    // Apply middleware chain
    const action = { type: meta.type || 'SET_STATE', payload: updater, meta };
    const processedState = this.applyMiddleware(prevState, nextState, action);

    // Freeze the new state
    this.state = this.deepFreeze(processedState);

    // Update history
    this.updateHistory(this.state);

    // Notify subscribers
    this.notifySubscribers(prevState, this.state, action);

    return this.state;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  applyMiddleware(prevState, nextState, action) {
    return this.middleware.reduce((state, middleware) => {
      return middleware(prevState, state, action) || state;
    }, nextState);
  }

  notifySubscribers(prevState, nextState, action) {
    this.subscribers.forEach(callback => {
      try {
        callback(nextState, prevState, action);
      } catch (error) {
        console.error('State subscriber error:', error);
      }
    });
  }

  updateHistory(newState) {
    // Remove future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(newState);
    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.currentIndex = this.history.length - 1;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const prevState = this.state;
      this.state = this.history[this.currentIndex];
      
      this.notifySubscribers(prevState, this.state, { type: 'UNDO' });
      return true;
    }
    return false;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const prevState = this.state;
      this.state = this.history[this.currentIndex];
      
      this.notifySubscribers(prevState, this.state, { type: 'REDO' });
      return true;
    }
    return false;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  deepClone(obj) {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }

    // Fallback for older browsers
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (obj instanceof Map) {
      const cloned = new Map();
      obj.forEach((value, key) => {
        cloned.set(key, this.deepClone(value));
      });
      return cloned;
    }

    if (obj instanceof Set) {
      const cloned = new Set();
      obj.forEach(value => {
        cloned.add(this.deepClone(value));
      });
      return cloned;
    }

    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }

    return obj;
  }

  deepFreeze(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Freeze the object itself
    Object.freeze(obj);

    // Recursively freeze properties
    Object.values(obj).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  // Utility methods for common state patterns
  updatePath(path, value) {
    return this.setState(state => {
      const keys = path.split('.');
      const result = this.deepClone(state);
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return result;
    }, { type: 'UPDATE_PATH', path, value });
  }

  mergePath(path, updates) {
    return this.setState(state => {
      const keys = path.split('.');
      const result = this.deepClone(state);
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }

      const finalKey = keys[keys.length - 1];
      current[finalKey] = { ...current[finalKey], ...updates };
      return result;
    }, { type: 'MERGE_PATH', path, updates });
  }

  reset(newState = {}) {
    this.state = this.deepFreeze(this.deepClone(newState));
    this.history = [this.state];
    this.currentIndex = 0;
    
    this.notifySubscribers({}, this.state, { type: 'RESET' });
    return this.state;
  }

  getHistory() {
    return [...this.history];
  }

  getStats() {
    return {
      subscriberCount: this.subscribers.size,
      middlewareCount: this.middleware.length,
      historySize: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
}