// Input Validation Utilities
import { CONSTANTS } from './constants.js';

export class InputValidator {
  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Limit input length
    if (input.length > CONSTANTS.MAX_INPUT_LENGTH) {
      input = input.substring(0, CONSTANTS.MAX_INPUT_LENGTH);
    }
    
    // Remove dangerous characters
    return input.replace(/[<>\"'&]/g, function(match) {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
  }
  
  static validateURL(url) {
    try {
      const urlObj = new URL(url);
      return CONSTANTS.ALLOWED_PROTOCOLS.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  static sanitizeLogInput(input) {
    if (typeof input !== 'string') return String(input);
    // Remove control characters, newlines, and potential log injection patterns
    return input.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '')
                .replace(/\$\{[^}]*\}/g, '[FILTERED]') // Remove template literals
                .substring(0, 500); // Limit log length
  }
  
  static validateCommand(command) {
    if (typeof command !== 'string') return false;
    
    // Only allow alphanumeric, hyphens, and underscores
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(command) && command.length <= 50;
  }
  
  static sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous elements
    const dangerousElements = temp.querySelectorAll(
      'script, iframe, object, embed, form, input, textarea, select, ' +
      'button[onclick], a[href^="javascript:"], a[href^="data:"], a[href^="vbscript:"]'
    );
    dangerousElements.forEach(el => el.remove());
    
    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on') || 
            ['javascript:', 'data:', 'vbscript:', 'srcdoc', 'formaction'].includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  }
  
  static validatePeriod(period) {
    const validPeriods = ['rolling', '2025', '2024', '2023', '2022'];
    return validPeriods.includes(period);
  }
  
  static validateAuthor(author) {
    if (typeof author !== 'string') return false;
    
    // GitHub username pattern: alphanumeric and hyphens, 1-39 chars
    const githubPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return githubPattern.test(author);
  }
}