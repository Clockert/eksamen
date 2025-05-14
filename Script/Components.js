/**
 * Components.js - Component functionality management
 *
 * This module provides JavaScript functionality for the site's reusable components.
 * Instead of generating HTML, it now only handles the behavior of components
 * that are loaded from templates.
 *
 * @author Charlotte Lockert
 */

/**
 * Initialize components after templates are loaded
 * Sets up event listeners and functionality for all components
 */
function initializeComponents() {
  // Initialize navigation
  initNavigation();

  // Initialize cart
  if (window.framCart && !window.framCart._initialized) {
    window.framCart.init();
  }
}

/**
 * Initializes navigation elements and their event handlers
 * Sets up menu opening/closing and other navigation behaviors
 */
function initNavigation() {
  // Get navigation elements
  const openMenuBtn = document.getElementById("open-menu");
  const closeMenuBtn = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  // Only set up handlers if elements exist
  if (openMenuBtn && menuOverlay) {
    openMenuBtn.addEventListener("click", () => {
      menuOverlay.classList.remove("menu--hidden");
    });
  }

  if (closeMenuBtn && menuOverlay) {
    closeMenuBtn.addEventListener("click", () => {
      menuOverlay.classList.add("menu--hidden");
    });
  }
}

// Wait for templates to be loaded before initializing components
document.addEventListener("templates-loaded", initializeComponents);

// Also wait for DOM to be fully loaded (fallback)
document.addEventListener("DOMContentLoaded", () => {
  // If templates are taking too long, initialize components after a delay
  setTimeout(() => {
    if (!document.querySelector("#navbar-container > header")) {
      console.warn(
        "Templates not loaded in time, initializing components directly"
      );
      initializeComponents();
    }
  }, 1000);
});
