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
    this._updateCache();
    return result;
  }

  static isAndroid() {
    if (this._cache) return this._cache.isAndroid;
    const result = navigator.userAgent.toLowerCase().includes('android');
    this._updateCache();
    return result;
  }

  static shouldRedirectToMobile() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceDesktop = urlParams.get('desktop') === 'true';
    const isOnMobilePage = window.location.pathname.includes('mobile.html');
    
    return this.isMobile() && !forceDesktop && !isOnMobilePage;
  }

  static _updateCache() {
    if (!this._cache) {
      this._cache = {
        isMobile: this.isMobile(),
        isAndroid: this.isAndroid(),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
    }
  }

  static getDeviceInfo() {
    this._updateCache();
    return { ...this._cache };
  }

  static clearCache() {
    this._cache = null;
  }
}
