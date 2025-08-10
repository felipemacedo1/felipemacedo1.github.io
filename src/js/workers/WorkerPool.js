/**
 * Web Worker Pool
 * Task queue with priority ordering and worker lifecycle management
 */
export class WorkerPool {
  constructor(workerScript, options = {}) {
    this.workerScript = workerScript;
    this.options = {
      maxWorkers: options.maxWorkers || navigator.hardwareConcurrency || 4,
      maxQueueSize: options.maxQueueSize || 100,
      workerTimeout: options.workerTimeout || 30000,
      ...options
    };

    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers = new Set();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.taskIdCounter = 0;
    this.stats = {
      tasksCompleted: 0,
      tasksErrored: 0,
      totalExecutionTime: 0
    };

    this.init();
  }

  init() {
    // Create initial workers
    for (let i = 0; i < Math.min(2, this.options.maxWorkers); i++) {
      this.createWorker();
    }
  }

  createWorker() {
    if (this.workers.length >= this.options.maxWorkers) {
      return null;
    }

    const worker = new Worker(this.workerScript);
    const workerId = `worker-${this.workers.length}`;
    
    worker._id = workerId;
    worker._createdAt = Date.now();
    worker._tasksCompleted = 0;

    worker.onmessage = (event) => {
      this.handleWorkerMessage(worker, event);
    };

    worker.onerror = (error) => {
      this.handleWorkerError(worker, error);
    };

    this.workers.push(worker);
    this.availableWorkers.push(worker);

    return worker;
  }

  async execute(data, options = {}) {
    return new Promise((resolve, reject) => {
      const task = {
        id: ++this.taskIdCounter,
        data,
        priority: options.priority || 0,
        timeout: options.timeout || this.options.workerTimeout,
        resolve,
        reject,
        createdAt: Date.now(),
        retries: options.retries || 0,
        maxRetries: options.maxRetries || 2
      };

      if (this.taskQueue.length >= this.options.maxQueueSize) {
        reject(new Error('Task queue is full'));
        return;
      }

      this.enqueueTask(task);
      this.processQueue();
    });
  }

  enqueueTask(task) {
    // Insert task in priority order (higher priority first)
    let insertIndex = this.taskQueue.length;
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (this.taskQueue[i].priority < task.priority) {
        insertIndex = i;
        break;
      }
    }

    this.taskQueue.splice(insertIndex, 0, task);
  }

  processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift();
      const worker = this.availableWorkers.shift();
      
      this.assignTaskToWorker(worker, task);
    }

    // Create additional workers if needed
    if (this.taskQueue.length > 0 && this.workers.length < this.options.maxWorkers) {
      const newWorker = this.createWorker();
      if (newWorker && this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        this.assignTaskToWorker(newWorker, task);
      }
    }
  }

  assignTaskToWorker(worker, task) {
    this.busyWorkers.add(worker);
    this.activeTasks.set(task.id, { worker, task, startTime: Date.now() });

    // Set timeout
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(task.id);
    }, task.timeout);

    task.timeoutId = timeoutId;

    // Send task to worker
    worker.postMessage({
      taskId: task.id,
      data: task.data
    });
  }

  handleWorkerMessage(worker, event) {
    const { taskId, result, error } = event.data;
    const taskInfo = this.activeTasks.get(taskId);
    
    if (!taskInfo) return;

    const { task, startTime } = taskInfo;
    const executionTime = Date.now() - startTime;

    // Clear timeout
    clearTimeout(task.timeoutId);

    // Update stats
    this.stats.totalExecutionTime += executionTime;
    worker._tasksCompleted++;

    // Remove from active tasks
    this.activeTasks.delete(taskId);
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);

    if (error) {
      this.stats.tasksErrored++;
      
      // Retry if possible
      if (task.retries < task.maxRetries) {
        task.retries++;
        this.enqueueTask(task);
        this.processQueue();
        return;
      }

      task.reject(new Error(error));
    } else {
      this.stats.tasksCompleted++;
      task.resolve(result);
    }

    // Process next task
    this.processQueue();
  }

  handleWorkerError(worker, error) {
    console.error(`Worker ${worker._id} error:`, error);
    
    // Find and reject all tasks assigned to this worker
    for (const [taskId, taskInfo] of this.activeTasks) {
      if (taskInfo.worker === worker) {
        clearTimeout(taskInfo.task.timeoutId);
        taskInfo.task.reject(new Error(`Worker error: ${error.message}`));
        this.activeTasks.delete(taskId);
      }
    }

    // Remove worker from all collections
    this.removeWorker(worker);

    // Create replacement worker
    this.createWorker();
    this.processQueue();
  }

  handleTaskTimeout(taskId) {
    const taskInfo = this.activeTasks.get(taskId);
    if (!taskInfo) return;

    const { worker, task } = taskInfo;
    
    // Terminate the worker (it's unresponsive)
    worker.terminate();
    this.removeWorker(worker);

    // Retry task if possible
    if (task.retries < task.maxRetries) {
      task.retries++;
      this.enqueueTask(task);
    } else {
      task.reject(new Error('Task timeout'));
    }

    this.activeTasks.delete(taskId);

    // Create replacement worker
    this.createWorker();
    this.processQueue();
  }

  removeWorker(worker) {
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
    }

    const availableIndex = this.availableWorkers.indexOf(worker);
    if (availableIndex !== -1) {
      this.availableWorkers.splice(availableIndex, 1);
    }

    this.busyWorkers.delete(worker);
  }

  getStats() {
    const avgExecutionTime = this.stats.tasksCompleted > 0 
      ? this.stats.totalExecutionTime / this.stats.tasksCompleted 
      : 0;

    return {
      ...this.stats,
      avgExecutionTime: Math.round(avgExecutionTime),
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      workerUtilization: this.workers.length > 0 
        ? (this.busyWorkers.size / this.workers.length * 100).toFixed(1)
        : 0
    };
  }

  async terminate() {
    // Reject all pending tasks
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker pool terminated'));
    });

    // Reject all active tasks
    for (const [taskId, taskInfo] of this.activeTasks) {
      clearTimeout(taskInfo.task.timeoutId);
      taskInfo.task.reject(new Error('Worker pool terminated'));
    }

    // Terminate all workers
    this.workers.forEach(worker => {
      worker.terminate();
    });

    // Clear all collections
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
    this.taskQueue = [];
    this.activeTasks.clear();
  }

  // Utility methods
  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.processQueue();
  }

  clear() {
    this.taskQueue.forEach(task => {
      task.reject(new Error('Queue cleared'));
    });
    this.taskQueue = [];
  }

  getQueuedTasks() {
    return this.taskQueue.map(task => ({
      id: task.id,
      priority: task.priority,
      createdAt: task.createdAt,
      retries: task.retries
    }));
  }
}