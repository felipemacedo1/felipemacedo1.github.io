// Security Configuration
export const SECURITY_CONFIG = {
  // Content Security Policy settings
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"], // Note: Remove unsafe-inline in production
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://api.github.com"],
    'font-src': ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
  },
  
  // Input sanitization rules
  SANITIZATION: {
    MAX_INPUT_LENGTH: 1000,
    ALLOWED_HTML_TAGS: ['span', 'div', 'p', 'br', 'strong', 'em', 'code', 'pre'],
    BLOCKED_ATTRIBUTES: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'],
    BLOCKED_PROTOCOLS: ['javascript:', 'data:', 'vbscript:', 'file:']
  },
  
  // Rate limiting
  RATE_LIMITS: {
    COMMANDS_PER_MINUTE: 60,
    API_CALLS_PER_MINUTE: 30,
    TOOLTIP_SHOW_DELAY: 100
  },
  
  // Validation patterns
  PATTERNS: {
    GITHUB_USERNAME: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
    COMMAND_NAME: /^[a-zA-Z0-9_-]+$/,
    SAFE_URL: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/
  }
};

// Security utility functions
export class SecurityUtils {
  static createSecureElement(tagName, attributes = {}, textContent = '') {
    const element = document.createElement(tagName);
    
    // Only allow safe attributes
    const safeAttributes = ['class', 'id', 'data-*', 'aria-*', 'role'];
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (safeAttributes.some(safe => key.match(safe.replace('*', '.*')))) {
        element.setAttribute(key, String(value));
      }
    });
    
    if (textContent) {
      element.textContent = String(textContent);
    }
    
    return element;
  }
  
  static isSecureURL(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  static sanitizeForLog(input) {
    if (typeof input !== 'string') return String(input);
    
    return input
      .replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '') // Remove control chars
      .replace(/\$\{[^}]*\}/g, '[FILTERED]') // Remove template literals
      .replace(/<[^>]*>/g, '[HTML]') // Remove HTML tags
      .substring(0, 200); // Limit length
  }
}