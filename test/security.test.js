/**
 * Security Tests
 */
import { TestRunner, assert } from './test-runner.js';
import { CSPManager } from '../src/js/security/CSPManager.js';
import { RateLimiter } from '../src/js/core/RateLimiter.js';

const runner = new TestRunner();

runner.describe('CSPManager', ({ it }) => {
  it('should generate cryptographic nonce', () => {
    const csp = new CSPManager();
    const nonce = csp.getNonce();
    
    assert.true(typeof nonce === 'string', 'Nonce should be string');
    assert.true(nonce.length > 10, 'Nonce should be sufficiently long');
    assert.true(!/[+/=]/.test(nonce), 'Nonce should not contain base64 padding');
  });

  it('should validate inline scripts', () => {
    const csp = new CSPManager();
    const mockScript = {
      getAttribute: (attr) => attr === 'nonce' ? csp.getNonce() : null
    };
    
    assert.true(csp.validateInlineScript(mockScript), 'Should validate correct nonce');
  });
});

runner.describe('RateLimiter', ({ it }) => {
  it('should allow requests within limit', () => {
    const limiter = new RateLimiter();
    const result = limiter.isAllowed('test-client');
    
    assert.true(result.allowed, 'Should allow first request');
    assert.true(typeof result.remaining === 'number', 'Should return remaining count');
  });

  it('should block requests exceeding limit', () => {
    const limiter = new RateLimiter();
    
    // Exhaust the limit
    for (let i = 0; i < 61; i++) {
      limiter.isAllowed('test-client');
    }
    
    const result = limiter.isAllowed('test-client');
    assert.true(!result.allowed, 'Should block request after limit exceeded');
  });

  it('should track metrics', () => {
    const limiter = new RateLimiter();
    limiter.isAllowed('client1');
    limiter.isAllowed('client2');
    
    const metrics = limiter.getMetrics();
    assert.true(metrics.totalRequests >= 2, 'Should track total requests');
    assert.true(metrics.activeClients >= 2, 'Should track active clients');
  });
});

// Run tests if this is the main module
if (import.meta.url === new URL(window.location).href) {
  runner.run();
}