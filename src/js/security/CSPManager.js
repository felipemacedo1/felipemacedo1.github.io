/**
 * Enterprise CSP Manager
 * Handles Content Security Policy with cryptographic nonce generation
 */
export class CSPManager {
  constructor() {
    this.nonce = this.generateNonce();
    this.policies = new Map();
    this.violations = [];
    this.init();
  }

  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '');
  }

  init() {
    this.setupViolationReporting();
    this.injectCSP();
  }

  injectCSP() {
    const csp = this.buildCSPString();
    
    // Inject via meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.insertBefore(meta, document.head.firstChild);

    // Store for validation
    this.policies.set('current', csp);
  }

  buildCSPString() {
    return [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${this.nonce}'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: https:`,
      `connect-src 'self' https://api.github.com`,
      `font-src 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ].join('; ');
  }

  setupViolationReporting() {
    document.addEventListener('securitypolicyviolation', (e) => {
      this.violations.push({
        timestamp: Date.now(),
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber
      });
      
      if (this.violations.length > 100) {
        this.violations = this.violations.slice(-50);
      }
    });
  }

  validateInlineScript(script) {
    return script.getAttribute('nonce') === this.nonce;
  }

  getNonce() {
    return this.nonce;
  }

  getViolations() {
    return [...this.violations];
  }
}