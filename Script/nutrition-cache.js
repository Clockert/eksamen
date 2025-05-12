/**
 * Nutrition API cache system
 *
 * This module implements an intelligent caching system for the USDA Food Data Central API.
 * It reduces API calls by storing nutrition data in localStorage with timestamps
 * and implements efficient cache management including expiration and pruning.
 *
 * Key features:
 * - Automatic cache expiration (24 hours)
 * - Intelligent pruning when storage limits are reached
 * - Fallback to expired cache when API is unavailable
 * - Normalized keys for consistent lookups
 *
 * @author Clockert
 */

// Create a global nutrition cache object
window.nutritionCache = {
  /**
   * Initialize the cache system
   * Loads existing cache from localStorage or creates a new empty cache
   */
  init: function () {
    // Load cache from localStorage if it exists
    try {
      this.cache = JSON.parse(localStorage.getItem("nutritionCache")) || {};
    } catch (error) {
      console.error("Error loading nutrition cache:", error);
      this.cache = {};
    }

    // Set cache expiration time (24 hours in milliseconds)
    this.expirationTime = 24 * 60 * 60 * 1000;
  },

  /**
   * Save the cache to localStorage
   * Handles exceptions and triggers pruning if storage is full
   */
  saveCache: function () {
    try {
      localStorage.setItem("nutritionCache", JSON.stringify(this.cache));
    } catch (error) {
      console.error("Error saving nutrition cache:", error);
      // If localStorage is full, clear old entries
      if (error.name === "QuotaExceededError") {
        this.pruneCache();
        localStorage.setItem("nutritionCache", JSON.stringify(this.cache));
      }
    }
  },

  /**
   * Remove old or excessive entries if cache gets too large
   * Removes the oldest 50% of entries based on timestamp
   */
  pruneCache: function () {
    const now = Date.now();
    const entries = Object.entries(this.cache);

    // Sort by age (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 50% of entries
    const entriesToRemove = Math.ceil(entries.length / 2);
    for (let i = 0; i < entriesToRemove; i++) {
      delete this.cache[entries[i][0]];
    }

    console.log(`Pruned ${entriesToRemove} entries from nutrition cache`);
  },

  /**
   * Get nutrition data for a product
   * Returns cached data if available, otherwise fetches from API
   *
   * @param {string} productName - Name of the product to get nutrition data for
   * @returns {Promise<Object>} Nutrition data object
   */
  getNutrition: async function (productName) {
    // Normalize product name for consistent cache keys
    const cacheKey = productName.toLowerCase().trim();

    // Check if we have cached data that's not expired
    if (this.cache[cacheKey]) {
      const cachedData = this.cache[cacheKey];
      const now = Date.now();

      // If cache is still valid, return it
      if (now - cachedData.timestamp < this.expirationTime) {
        console.log(`Using cached nutrition data for ${productName}`);
        return cachedData.data;
      }
    }

    // No valid cache, fetch from API
    console.log(`Fetching nutrition data for ${productName}`);
    try {
      // Use the full URL with the correct port (3000)
      const response = await fetch(
        `http://localhost:3000/api/nutrition/${encodeURIComponent(productName)}`
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(
          `Nutrition API responded with status: ${response.status}`
        );
      }

      // Parse the JSON response
      const data = await response.json();

      // Cache the result with a timestamp
      this.cache[cacheKey] = {
        data: data,
        timestamp: Date.now(),
      };

      // Save cache to localStorage
      this.saveCache();

      return data;
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      // If we have any cached data (even if expired), return it as fallback
      if (this.cache[cacheKey]) {
        console.log(`Using expired cache as fallback for ${productName}`);
        return this.cache[cacheKey].data;
      }
      return null;
    }
  },

  /**
   * Clear the entire cache
   * Removes all cached nutrition data from memory and localStorage
   */
  clearCache: function () {
    this.cache = {};
    localStorage.removeItem("nutritionCache");
    console.log("Nutrition cache cleared");
  },
};

// Initialize the cache when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.nutritionCache.init();
});
