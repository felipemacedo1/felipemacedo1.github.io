// Device Detection Utility
export class DeviceDetector {
  static isMobile() {
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
    
    return isMobileUA || (isTouchDevice && isSmallScreen);
  }

  static isAndroid() {
    return navigator.userAgent.toLowerCase().includes('android');
  }

  static getDeviceInfo() {
    return {
      isMobile: this.isMobile(),
      isAndroid: this.isAndroid(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: navigator.userAgent
    };
  }
}
