// Application Constants
export const CONSTANTS = {
  // Terminal Configuration
  TYPEWRITER_SPEED: 50,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 150,
  TOOLTIP_DURATION: 3000,
  
  // Performance
  MAX_SUGGESTIONS: 5,
  MAX_HISTORY_ITEMS: 100,
  CACHE_DURATION: 300000, // 5 minutes
  
  // UI Dimensions
  CELL_SIZE_COMPACT: 8,
  CELL_SIZE_NORMAL: 11,
  CELL_SIZE_LARGE: 14,
  
  // Contribution Levels
  CONTRIBUTION_LEVELS: {
    NONE: 0,
    LOW: 2,
    MEDIUM: 5,
    HIGH: 10
  },
  
  // Security
  MAX_INPUT_LENGTH: 1000,
  ALLOWED_PROTOCOLS: ['http:', 'https:', 'mailto:'],
  
  // Mobile
  HAPTIC_FEEDBACK_DURATION: 10,
  PULL_TO_REFRESH_THRESHOLD: 50,
  MAX_PULL_DISTANCE: 80,
  
  // GitHub API
  GITHUB_API_TIMEOUT: 5000,
  MAX_RETRY_ATTEMPTS: 3,
  
  // Progress Levels
  PROGRESS_LEVELS: [
    { threshold: 5, title: 'Explorer', icon: '🏆' },
    { threshold: 10, title: 'Expert', icon: '🎖️' },
    { threshold: 15, title: 'Master', icon: '👑' },
    { threshold: 20, title: 'Legend', icon: '⭐' }
  ]
};

// Theme Colors
export const THEMES = {
  GITHUB: {
    LEVELS: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
  },
  TERMINAL: {
    LEVELS: ['#001100', '#003300', '#005500', '#007700', '#00ff00']
  },
  BIOS: {
    LEVELS: ['#0a1a1a', '#0d2d2a', '#1a4a44', '#26665e', '#03DAC6']
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  WIDGET_INIT_FAILED: 'Failed to initialize widget',
  DATA_LOAD_FAILED: 'Failed to load data',
  NETWORK_ERROR: 'Network connection error',
  INVALID_INPUT: 'Invalid input provided',
  PERMISSION_DENIED: 'Permission denied',
  TIMEOUT_ERROR: 'Request timeout'
};