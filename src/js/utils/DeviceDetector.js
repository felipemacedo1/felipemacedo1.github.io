// Device Detection Utility
export class DeviceDetector {
  static _cache = null;
  
  static isMobile() {
    if (this._cache) return this._cache.isMobile;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'webos', 'iphone', 'ipad', 'ipod', 
      'blackberry', 'windows phone', 'mobile'
    ];
    
    const isMobileUA = mobileKeywords.some(keyword => 
      userAgent.includes(keyword)
    );
    
    const isTouchDevice = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0;
    
    const isSmallScreen = window.innerWidth <= 768;
    
    const result = isMobileUA || (isTouchDevice && isSmallScreen);
    
    // Cache result to avoid recalculation
    if (!this._cache) {
      this._cache = {
        isMobile: result,
        isAndroid: navigator.userAgent.toLowerCase().includes('android'),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
    }
    
    return result;
  }

  static isAndroid() {
    if (this._cache) return this._cache.isAndroid;
    // Trigger cache creation through isMobile if not cached
    this.isMobile();
    return this._cache.isAndroid;
  }

  static shouldRedirectToMobile() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceDesktop = urlParams.get('desktop') === 'true';
    const isOnMobilePage = window.location.pathname.includes('mobile.html');
    
    return this.isMobile() && !forceDesktop && !isOnMobilePage;
  }

  static getDeviceInfo() {
    // Ensure cache is populated
    this.isMobile();
    return { ...this._cache };
  }

  static clearCache() {
    this._cache = null;
  }
}
