// Main entry point
import { TerminalPortfolio } from './TerminalPortfolio.js';
import { DeviceDetector } from './utils/DeviceDetector.js';

// Check if should redirect to mobile version
function checkMobileRedirect() {
  const deviceInfo = DeviceDetector.getDeviceInfo();
  
  // Don't redirect if user specifically wants desktop version
  const urlParams = new URLSearchParams(window.location.search);
  const forceDesktop = urlParams.get('desktop') === 'true';
  
  if (deviceInfo.isMobile && !forceDesktop) {
    // Add a small delay to show loading, then redirect
    setTimeout(() => {
      window.location.href = './mobile.html';
    }, 800);
    return true;
  }
  
  return false;
}

// Mobile keyboard functions
function typeChar(char) {
  const input = document.getElementById("commandInput");
  input.value += char;
  input.focus();
}

function typeCommand(command) {
  const input = document.getElementById("commandInput");
  input.value = command;
  input.focus();

  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
  });
  input.dispatchEvent(event);
}

// Loading screen
function createLoadingScreen() {
  const loadingScreen = document.createElement("div");
  loadingScreen.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: #00ff00;
      font-family: 'Courier New', monospace;
    ">
      <div style="text-align: center;">
        <div class="loading"></div>
        <p style="margin-top: 20px;">Inicializando terminal...</p>
      </div>
    </div>`;

  document.body.appendChild(loadingScreen);

  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    loadingScreen.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      document.body.removeChild(loadingScreen);
    }, 500);
  }, 1500);
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  // Check if should redirect to mobile
  if (checkMobileRedirect()) {
    return; // Stop initialization if redirecting
  }
  
  window.terminal = new TerminalPortfolio();
  
  // Expose mobile functions globally
  window.typeChar = typeChar;
  window.typeCommand = typeCommand;
});

window.addEventListener("load", createLoadingScreen);