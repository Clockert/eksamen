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
   * @type {Object} Cache storage with product names as keys and cached data as values
   */
  cache: {},

  /**
   * @type {number} Cache expiration time in milliseconds (24 hours)
   */
  expirationTime: 24 * 60 * 60 * 1000,

  /**
   * Initialize the cache system
   * Loads existing cache from localStorage or creates a new empty cache
   *
   * @returns {void}
   */
  init: function () {
    // Load cache from localStorage if it exists
    try {
      this.cache = JSON.parse(localStorage.getItem("nutritionCache")) || {};
    } catch (error) {
      console.error("Error loading nutrition cache:", error);
      this.cache = {};
    }
  },

  /**
   * Save the cache to localStorage
   * Handles exceptions and triggers pruning if storage is full
   *
   * @returns {void}
   * @throws {Error} If localStorage is unavailable or fails
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
   *
   * @returns {void}
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
   * @returns {Promise<Object|null>} Nutrition data object or null if unavailable
   * @throws {Error} If API request fails and no cached data is available
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
   *
   * @returns {void}
   */
  clearCache: function () {
    this.cache = {};
    localStorage.removeItem("nutritionCache");
    console.log("Nutrition cache cleared");
  },
};

/**
 * Fetches nutrition data for a product, with caching and fallback
 * Uses a multi-layer approach:
 * 1. Check cache
 * 2. Call API
 * 3. Use fallback data
 *
 * @param {string} productName - Name of the product to look up
 * @returns {Promise<void>}
 */
async function fetchNutritionData(productName) {
  try {
    let nutritionData;
    let usingFallback = false;

    // Try cache first for performance optimization
    if (
      window.nutritionCache &&
      typeof window.nutritionCache.getNutrition === "function"
    ) {
      try {
        nutritionData = await window.nutritionCache.getNutrition(productName);
      } catch (cacheError) {
        console.error("Cache error:", cacheError);
        // Continue to API call if cache fails
      }
    }

    // If no cached data available, attempt API call
    if (!nutritionData) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/nutrition/${encodeURIComponent(
            productName
          )}`
        );
        if (!response.ok) {
          throw new Error(`Nutrition API error: ${response.status}`);
        }
        nutritionData = await response.json();
      } catch (apiError) {
        console.error("API error:", apiError);
        // Fall back to basic nutrition data when API fails
        usingFallback = true;
        nutritionData = getBasicNutritionFallback(productName);
      }
    }

    // Display nutrition data with fallback warning if necessary
    if (nutritionData) {
      displayNutritionInfo(nutritionData.foods?.[0], usingFallback);
    } else {
      throw new Error("No nutrition data available");
    }
  } catch (error) {
    console.error("Nutrition data error:", error);
    const container = document.querySelector(".nutrition-data");
    if (container) {
      container.innerHTML =
        '<p class="product-detail__nutrition-error">Failed to load nutrition information. Please try again later.</p>';
    }
  }
}

/**
 * Provides basic fallback nutrition data for common foods
 * Used when both cache and API calls fail
 *
 * @param {string} productName - Name of the product
 * @returns {Object|null} Basic nutrition data or null if no match
 */
function getBasicNutritionFallback(productName) {
  // Basic fallback data for common foods
  if (productName.toLowerCase().includes("apple")) {
    return {
      foods: [
        {
          foodNutrients: [
            { nutrientId: 1008, value: 52, unitName: "kcal" },
            { nutrientId: 1003, value: 0.3, unitName: "g" },
          ],
        },
      ],
    };
  }
  return null;
}

// Initialize the cache when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.nutritionCache.init();
});
