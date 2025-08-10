/**
 * Minimal Test Runner
 * Custom test harness without external dependencies
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.startTime = 0;
  }

  describe(description, testFn) {
    const suite = {
      description,
      tests: [],
      beforeEach: null,
      afterEach: null
    };

    const context = {
      it: (testDescription, testCase) => {
        suite.tests.push({
          description: testDescription,
          testCase,
          suite: description
        });
      },
      beforeEach: (fn) => {
        suite.beforeEach = fn;
      },
      afterEach: (fn) => {
        suite.afterEach = fn;
      }
    };

    testFn(context);
    this.tests.push(suite);
  }

  async run() {
    this.startTime = performance.now();
    console.log('🧪 Starting test run...\n');

    for (const suite of this.tests) {
      console.log(`📋 ${suite.description}`);
      
      for (const test of suite.tests) {
        try {
          if (suite.beforeEach) {
            await suite.beforeEach();
          }

          await test.testCase();
          
          if (suite.afterEach) {
            await suite.afterEach();
          }

          console.log(`  ✅ ${test.description}`);
          this.results.passed++;
        } catch (error) {
          console.log(`  ❌ ${test.description}`);
          console.log(`     Error: ${error.message}`);
          this.results.failed++;
        }
        this.results.total++;
      }
      console.log('');
    }

    this.printSummary();
  }

  printSummary() {
    const duration = performance.now() - this.startTime;
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log('📊 Test Summary');
    console.log('================');
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    }
  }
}

export const assert = {
  equal(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },

  true(value, message = '') {
    if (value !== true) {
      throw new Error(`${message}\nExpected: true\nActual: ${value}`);
    }
  },

  throws(fn, message = '') {
    try {
      fn();
      throw new Error(`${message}\nExpected function to throw`);
    } catch (error) {
      // Expected behavior
    }
  }
};