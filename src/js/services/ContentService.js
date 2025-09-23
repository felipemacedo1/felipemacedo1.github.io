/**
 * ContentService - Centralized content management for Terminal Portfolio
 * Loads and provides access to content.json data with platform filtering
 */

class ContentService {
  constructor() {
    this.data = null;
    this.isLoading = false;
    this.loadPromise = null;
  }

  /**
   * Load content.json data
   * @returns {Promise<Object>} Loaded content data
   */
  async load() {
    if (this.data) return this.data;
    if (this.loadPromise) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = this._fetchContent();
    
    try {
      this.data = await this.loadPromise;
      return this.data;
    } catch (error) {
      console.error('ContentService: Failed to load content.json', error);
      this.data = this._getFallbackData();
      return this.data;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch content from JSON file
   * @private
   */
  async _fetchContent() {
    const response = await fetch('./content.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get fallback data structure
   * @private
   */
  _getFallbackData() {
    return {
      meta: {},
      contact: {},
      education: { formal: [], bootcamps: [] },
      experience: [],
      skills: { backend: [], frontend: [], devops: [] },
      certifications: { cloud: { items: [] }, blockchain: { items: [] }, development: { items: [] }, management: { items: [] }, inProgress: [] },
      projects: [],
      availability: {},
      commands: { basic: [], professional: [], system: [], external: [], easter_eggs: [] },
      themes: { available: [] },
      analytics: {},
      texts: {}
    };
  }

  /**
   * Filter data by platform source
   * @param {Array|Object} data - Data to filter
   * @param {string} platform - Platform filter ('desktop', 'mobile', 'both')
   * @returns {Array|Object} Filtered data
   */
  filterBySource(data, platform = 'both') {
    if (!data || platform === 'both') return data;

    if (Array.isArray(data)) {
      return data.filter(item => {
        if (!item.source) return true;
        return item.source.includes(platform);
      });
    }

    if (typeof data === 'object' && data.source) {
      return data.source.includes(platform) ? data : null;
    }

    return data;
  }

  /**
   * Check if content is loaded
   * @returns {boolean}
   */
  isLoaded() {
    return this.data !== null;
  }

  /**
   * Get all content data
   * @returns {Promise<Object>}
   */
  async getAll() {
    await this.load();
    return this.data;
  }

  /**
   * Get meta information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getMeta(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.meta || {}, platform);
  }

  /**
   * Get contact information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getContact(platform = 'both') {
    await this.load();
    const contact = this.data.contact || {};
    
    // Filter WhatsApp for mobile (source: desktop only)
    if (platform === 'mobile' && contact.whatsapp) {
      const { whatsapp, ...mobileContact } = contact;
      return mobileContact;
    }
    
    return this.filterBySource(contact, platform);
  }

  /**
   * Get education information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getEducation(platform = 'both') {
    await this.load();
    const education = this.data.education || { formal: [], bootcamps: [] };
    return {
      formal: this.filterBySource(education.formal || [], platform),
      bootcamps: this.filterBySource(education.bootcamps || [], platform)
    };
  }

  /**
   * Get experience information
   * @param {string} platform - Platform filter
   * @returns {Promise<Array>}
   */
  async getExperience(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.experience || [], platform);
  }

  /**
   * Get skills information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getSkills(platform = 'both') {
    await this.load();
    const skills = this.data.skills || { backend: [], frontend: [], devops: [] };
    return {
      backend: this.filterBySource(skills.backend || [], platform),
      frontend: this.filterBySource(skills.frontend || [], platform),
      devops: this.filterBySource(skills.devops || [], platform)
    };
  }

  /**
   * Get certifications information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getCertifications(platform = 'both') {
    await this.load();
    const certs = this.data.certifications || {};
    
    // Handle new structure with categories containing items
    const result = {};
    
    Object.entries(certs).forEach(([key, value]) => {
      if (key === 'inProgress') {
        result[key] = this.filterBySource(value || [], platform);
      } else if (value && typeof value === 'object' && value.items) {
        result[key] = {
          ...value,
          items: this.filterBySource(value.items || [], platform)
        };
      } else {
        result[key] = this.filterBySource(value || [], platform);
      }
    });
    
    return result;
  }

  /**
   * Get projects information
   * @param {string} platform - Platform filter
   * @returns {Promise<Array>}
   */
  async getProjects(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.projects || [], platform);
  }

  /**
   * Get availability information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getAvailability(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.availability || {}, platform);
  }

  /**
   * Get commands information (desktop only)
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getCommands(platform = 'desktop') {
    await this.load();
    const commands = this.data.commands || {};
    
    // Commands are desktop-only by default
    if (platform === 'mobile') {
      return { basic: [], professional: [], system: [], external: [], easter_eggs: [] };
    }
    
    return {
      basic: this.filterBySource(commands.basic || [], platform),
      professional: this.filterBySource(commands.professional || [], platform),
      system: this.filterBySource(commands.system || [], platform),
      external: this.filterBySource(commands.external || [], platform),
      easter_eggs: this.filterBySource(commands.easter_eggs || [], platform)
    };
  }

  /**
   * Get themes information (desktop only)
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getThemes(platform = 'desktop') {
    await this.load();
    const themes = this.data.themes || {};
    
    // Themes are desktop-only by default
    if (platform === 'mobile') {
      return { available: [] };
    }
    
    return {
      available: this.filterBySource(themes.available || [], platform)
    };
  }

  /**
   * Get analytics information
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getAnalytics(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.analytics || {}, platform);
  }

  /**
   * Get text content (about, whoami, etc.)
   * @param {string} platform - Platform filter
   * @returns {Promise<Object>}
   */
  async getTexts(platform = 'both') {
    await this.load();
    return this.filterBySource(this.data.texts || {}, platform);
  }

  /**
   * Get specific text by key
   * @param {string} key - Text key (about, whoami, etc.)
   * @param {string} platform - Platform filter
   * @returns {Promise<string>}
   */
  async getText(key, platform = 'both') {
    const texts = await this.getTexts(platform);
    return texts[key] || '';
  }

  /**
   * Get featured projects only
   * @param {string} platform - Platform filter
   * @returns {Promise<Array>}
   */
  async getFeaturedProjects(platform = 'both') {
    const projects = await this.getProjects(platform);
    return projects.filter(project => project.featured === true);
  }

  /**
   * Get skills by category
   * @param {string} category - Skill category (backend, frontend, devops)
   * @param {string} platform - Platform filter
   * @returns {Promise<Array>}
   */
  async getSkillsByCategory(category, platform = 'both') {
    const skills = await this.getSkills(platform);
    return skills[category] || [];
  }

  /**
   * Clear cached data (useful for testing)
   */
  clearCache() {
    this.data = null;
    this.isLoading = false;
    this.loadPromise = null;
  }
}

// Create singleton instance
const contentService = new ContentService();

export default contentService;