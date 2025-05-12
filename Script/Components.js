/**
 * Components.js
 *
 * This module provides reusable UI components for the Fram website.
 * It handles dynamic component loading, navigation, and other shared UI elements.
 *
 * Key features:
 * - Dynamically injects common components (navbar, footer)
 * - Sets up event listeners for interactive elements
 * - Conditionally loads components based on page configuration
 * - Provides helper functions for popular product displays
 *
 * @author Clockert
 */

/**
 * Loads the navbar component and initializes its functionality
 *
 * Creates the navigation bar with hamburger menu, logo, and cart button
 * Sets up event handlers for menu opening/closing
 *
 * @returns {void}
 */

function loadNavbar() {
  // Define navbar HTML structure with BEM class naming
  const navbarHTML = `
  <header>
    <nav class="navbar">
      <!-- Hamburger menu -->
      <button class="navbar__hamburger" id="open-menu" aria-label="Open menu">
        <img src="assets/bars.png" alt="Menu" class="navbar__hamburger-icon" />
      </button>

      <!-- Center Logo -->
      <a href="index.html" class="navbar__logo">Fram</a>

      <!-- Cart Button -->
      <button class="navbar__cart" id="open-cart" aria-label="Open cart">0</button>
    </nav>
  </header>

  <!-- Menu overlay -->
  <div id="menu-overlay" class="menu menu--hidden">
    <div class="menu__header">
      <button id="close-menu" class="menu__close-button" aria-label="Close menu">
        ✕
      </button>
      <a href="index.html" class="menu__logo">Fram</a>
    </div>

    <div class="menu__content">
      <nav>
        <ul class="menu__nav">
          <li class="menu__item">
            <a href="produce.html" class="menu__link">Products</a>
          </li>
          <li class="menu__item">
            <a href="chatbot.html" class="menu__link">Chat</a>
          </li>
        </ul>
      </nav>
      <a href="checkout.html" class="menu__checkout">Checkout</a>
    </div>
  </div>
`;

  // Insert navbar and menu overlay
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);

  // Setup event listeners once elements exist in the DOM
  const openMenuBtn = document.getElementById("open-menu");
  const closeMenuBtn = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  // Open menu event handler
  openMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.remove("menu--hidden");
  });

  // Close menu event handler
  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("menu--hidden");
  });
}

/**
 * Loads the footer component
 *
 * Creates the site footer with logo, divider, newsletter signup, and legal information
 *
 * @returns {void}
 */
function loadFooter() {
  // Define footer HTML structure with BEM class naming
  const footerHTML = `
    <footer class="footer">
      <a href="index.html" class="footer__logo">Fram</a>

      <hr class="footer__divider" aria-hidden="true" />

      <div class="footer__content">
        <div class="footer__text">
          <h2 class="footer__heading">Stay updated</h2>
          <p class="footer__description">
            Sign up for our newsletter to be the first to know about new produce
            or other exciting news!
          </p>
        </div>

        <form
          class="footer__form"
          action="/subscribe"
          method="post"
          aria-labelledby="newsletter-heading"
        >
          <span id="newsletter-heading" class="visually-hidden">
            Newsletter Signup
          </span>

          <label for="first-name" class="visually-hidden">First Name</label>
          <input
            type="text"
            id="first-name"
            name="first-name"
            placeholder="First name"
            required
            class="footer__input"
            autocomplete="given-name"
          />

          <label for="email" class="visually-hidden">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail address"
            required
            class="footer__input"
            autocomplete="email"
          />

          <button type="submit" class="footer__button">Send</button>
        </form>
      </div>
    </footer>
  `;

  // Insert footer at end of body
  document.body.insertAdjacentHTML("beforeend", footerHTML);
}

/**
 * Loads the Popular Produce component and populates it with products
 *
 * Creates a section displaying featured products in a grid/carousel layout
 * Fetches product data from JSON and filters for popular items
 *
 * @param {string} containerId - ID of the container element to insert the component
 * @returns {void}
 */
function loadPopularProduce(containerId) {
  // Create the component HTML structure
  const popularProduceHTML = `
    <section class="popular-produce">
      <div class="popular-produce__header">
        <h2 id="popular-produce-title" class="popular-produce__title">Popular Produce</h2>
      </div>
      <div id="popular-products-grid" class="popular-produce__grid" aria-label="Popular products carousel"></div>
    </section>
  `;

  // Get the container element where the component will be placed
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID '${containerId}' not found`);
    return;
  }

  // Insert the component HTML into the container
  container.innerHTML = popularProduceHTML;

  // Load products data from JSON file and populate the grid
  fetch("data/products.json")
    .then((response) => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Filter for popular products only
      const popularProducts = data.products.filter(
        (product) => product.popular
      );

      // Display products in the grid using the productRenderer
      const grid = document.getElementById("popular-products-grid");
      if (grid && window.productRenderer) {
        window.productRenderer.displayProducts(popularProducts, grid);
      } else {
        console.error(
          "productRenderer not available - make sure productRenderer.js is loaded"
        );
        document.getElementById("popular-products-grid").innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't load the popular products. Please try again later.</p>
        </div>
      `;
      }
    })
    .catch((error) => {
      // Handle any errors in fetching or displaying products
      console.error("Error loading popular products:", error);
      document.getElementById("popular-products-grid").innerHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't load the popular products. Please try again later.</p>
      </div>
    `;
    });
}

/**
 * Initialize components based on data attributes in the HTML
 * This allows pages to control which components to load
 *
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  // Get page configuration from html tag
  const htmlElement = document.documentElement;

  /**
   * @typedef {Object} PageConfig - Configuration for component loading
   * @property {boolean} navbar - Whether to load the navbar component
   * @property {boolean} footer - Whether to load the footer component
   */

  /** @type {PageConfig} */
  const pageConfig = {
    navbar: htmlElement.getAttribute("data-load-navbar") !== "false", // Default to true
    footer: htmlElement.getAttribute("data-load-footer") !== "false", // Default to true
  };

  // Load components according to configuration
  if (pageConfig.navbar) {
    loadNavbar();
  }

  if (pageConfig.footer) {
    loadFooter();
  }

  // Popular produce component is loaded on demand by individual pages
  // using window.loadPopularProduce(containerId)
});
