/**
 * Micro-Frontend Module Federation
 * Manual module registry with dynamic imports and health checks
 */
export class ModuleFederation {
  constructor() {
    this.modules = new Map();
    this.healthChecks = new Map();
    this.loadingPromises = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }

  async registerModule(name, config) {
    const moduleConfig = {
      name,
      url: config.url,
      version: config.version || '1.0.0',
      dependencies: config.dependencies || [],
      healthCheck: config.healthCheck,
      fallback: config.fallback,
      timeout: config.timeout || 5000,
      ...config
    };

    this.modules.set(name, moduleConfig);
    
    if (moduleConfig.healthCheck) {
      this.setupHealthCheck(name, moduleConfig.healthCheck);
    }

    return moduleConfig;
  }

  async loadModule(name) {
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const config = this.modules.get(name);
    if (!config) {
      throw new Error(`Module ${name} not registered`);
    }

    const loadPromise = this.performModuleLoad(name, config);
    this.loadingPromises.set(name, loadPromise);

    try {
      const module = await loadPromise;
      this.retryAttempts.delete(name);
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  async performModuleLoad(name, config) {
    const retries = this.retryAttempts.get(name) || 0;
    
    try {
      // Check dependencies first
      await this.loadDependencies(config.dependencies);

      // Load module with timeout
      const module = await Promise.race([
        import(config.url),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Module load timeout')), config.timeout)
        )
      ]);

      // Validate module structure
      if (!this.validateModule(module, config)) {
        throw new Error(`Module ${name} validation failed`);
      }

      return module;
    } catch (error) {
      if (retries < this.maxRetries) {
        this.retryAttempts.set(name, retries + 1);
        await this.delay(Math.pow(2, retries) * 1000); // Exponential backoff
        return this.performModuleLoad(name, config);
      }

      // Use fallback if available
      if (config.fallback) {
        return config.fallback;
      }

      throw error;
    }
  }

  async loadDependencies(dependencies) {
    if (!dependencies.length) return;

    const loadPromises = dependencies.map(dep => this.loadModule(dep));
    await Promise.all(loadPromises);
  }

  validateModule(module, config) {
    if (!module.default && !module[config.exportName || 'default']) {
      return false;
    }

    if (config.requiredMethods) {
      const exportedModule = module.default || module[config.exportName];
      return config.requiredMethods.every(method => 
        typeof exportedModule[method] === 'function'
      );
    }

    return true;
  }

  setupHealthCheck(name, healthCheckFn) {
    const interval = setInterval(async () => {
      try {
        const isHealthy = await healthCheckFn();
        if (!isHealthy) {
          this.handleUnhealthyModule(name);
        }
      } catch (error) {
        this.handleUnhealthyModule(name);
      }
    }, 30000); // Check every 30 seconds

    this.healthChecks.set(name, interval);
  }

  handleUnhealthyModule(name) {
    // Remove from cache to force reload on next access
    this.loadingPromises.delete(name);
    this.retryAttempts.delete(name);
    
    // Emit event for monitoring
    this.emit('module-unhealthy', { name, timestamp: Date.now() });
  }

  getModuleInfo(name) {
    const config = this.modules.get(name);
    if (!config) return null;

    return {
      ...config,
      loaded: this.loadingPromises.has(name),
      retries: this.retryAttempts.get(name) || 0
    };
  }

  getAllModules() {
    return Array.from(this.modules.keys()).map(name => this.getModuleInfo(name));
  }

  unregisterModule(name) {
    this.modules.delete(name);
    this.loadingPromises.delete(name);
    this.retryAttempts.delete(name);
    
    const healthCheck = this.healthChecks.get(name);
    if (healthCheck) {
      clearInterval(healthCheck);
      this.healthChecks.delete(name);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simple event emitter
  emit(event, data) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`module-federation:${event}`, { detail: data }));
    }
  }
}