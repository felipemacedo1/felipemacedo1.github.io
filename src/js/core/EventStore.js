/**
 * Event-Driven Architecture Store
 * Pub/sub system with event replay from IndexedDB
 */
export class EventStore {
  constructor() {
    this.eventTarget = new EventTarget();
    this.subscribers = new Map();
    this.eventHistory = [];
    this.dbName = 'terminal-events';
    this.dbVersion = 1;
    this.maxHistorySize = 1000;
    this.db = null;
    
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          store.createIndex('type', 'type');
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('aggregateId', 'aggregateId');
        }
      };
    });
  }

  subscribe(eventType, handler, options = {}) {
    const subscription = {
      id: this.generateId(),
      eventType,
      handler,
      once: options.once || false,
      priority: options.priority || 0,
      filter: options.filter
    };

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const handlers = this.subscribers.get(eventType);
    handlers.push(subscription);
    
    // Sort by priority (higher first)
    handlers.sort((a, b) => b.priority - a.priority);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, subscription.id);
  }

  unsubscribe(eventType, subscriptionId) {
    const handlers = this.subscribers.get(eventType);
    if (!handlers) return false;

    const index = handlers.findIndex(sub => sub.id === subscriptionId);
    if (index === -1) return false;

    handlers.splice(index, 1);
    
    if (handlers.length === 0) {
      this.subscribers.delete(eventType);
    }

    return true;
  }

  async publish(eventType, data, options = {}) {
    const event = {
      id: this.generateId(),
      type: eventType,
      data,
      timestamp: Date.now(),
      aggregateId: options.aggregateId,
      version: options.version || 1,
      metadata: options.metadata || {}
    };

    // Store in memory
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }

    // Persist to IndexedDB if enabled
    if (options.persist !== false) {
      await this.persistEvent(event);
    }

    // Notify subscribers
    await this.notifySubscribers(event);

    return event;
  }

  async notifySubscribers(event) {
    const handlers = this.subscribers.get(event.type) || [];
    const promises = [];

    for (const subscription of handlers) {
      // Apply filter if present
      if (subscription.filter && !subscription.filter(event)) {
        continue;
      }

      const promise = this.executeHandler(subscription, event);
      promises.push(promise);

      // Remove one-time subscribers
      if (subscription.once) {
        this.unsubscribe(event.type, subscription.id);
      }
    }

    await Promise.allSettled(promises);
  }

  async executeHandler(subscription, event) {
    try {
      await subscription.handler(event);
    } catch (error) {
      console.error(`Event handler error for ${event.type}:`, error);
      
      // Publish error event
      this.publish('handler-error', {
        originalEvent: event,
        subscription: subscription.id,
        error: error.message
      }, { persist: false });
    }
  }

  async persistEvent(event) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      const request = store.add(event);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getEvents(filter = {}) {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      
      let request;
      
      if (filter.type) {
        const index = store.index('type');
        request = index.getAll(filter.type);
      } else if (filter.aggregateId) {
        const index = store.index('aggregateId');
        request = index.getAll(filter.aggregateId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let events = request.result;
        
        // Apply additional filters
        if (filter.since) {
          events = events.filter(e => e.timestamp >= filter.since);
        }
        
        if (filter.until) {
          events = events.filter(e => e.timestamp <= filter.until);
        }

        resolve(events);
      };
    });
  }

  async replay(filter = {}) {
    const events = await this.getEvents(filter);
    
    for (const event of events) {
      await this.notifySubscribers(event);
    }

    return events.length;
  }

  getSubscriberCount(eventType) {
    const handlers = this.subscribers.get(eventType);
    return handlers ? handlers.length : 0;
  }

  getAllEventTypes() {
    return Array.from(this.subscribers.keys());
  }

  getMemoryEvents(filter = {}) {
    let events = [...this.eventHistory];

    if (filter.type) {
      events = events.filter(e => e.type === filter.type);
    }

    if (filter.since) {
      events = events.filter(e => e.timestamp >= filter.since);
    }

    if (filter.aggregateId) {
      events = events.filter(e => e.aggregateId === filter.aggregateId);
    }

    return events;
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clear() {
    this.eventHistory = [];
    this.subscribers.clear();
    
    if (this.db) {
      const transaction = this.db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      store.clear();
    }
  }
}