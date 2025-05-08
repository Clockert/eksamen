/**
 * Components.js
 *
 * This module provides reusable UI components for the Fram website.
 * It handles dynamic component loading, navigation, cart management,
 * and other shared UI elements across pages.
 *
 * @author Your Name
 * @version 1.0
 */

/**
 * Loads the navbar component and initializes its functionality
 * The navbar includes the main navigation, logo, and cart button
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

  <!-- Cart Popup Component -->
  <div id="cart-overlay" class="cart cart--hidden">
    <div class="cart__header">
      <h2 class="cart__title">Your Cart</h2>
      <button id="close-cart" class="cart__close-button" aria-label="Close cart">
        ✕
      </button>
    </div>

    <div class="cart__content">
      <div class="cart__items" id="cart-items">
        <!-- Cart items will be dynamically added here -->
      </div>
      
      <div class="cart__summary">
        <div class="cart__total">
          <span>Total:</span>
          <span id="cart-total">0 kr</span>
        </div>
        <a href="checkout.html" class="cart__checkout-button">Proceed to Checkout</a>
      </div>
      
      <div class="cart__empty" id="cart-empty">
        <p>Your cart is empty</p>
        <a href="produce.html" class="cart__browse-link">Browse Products</a>
      </div>
    </div>
  </div>
`;

  // Insert navbar and menu overlay
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);

  // Setup event listeners once elements exist in the DOM
  const openMenuBtn = document.getElementById("open-menu");
  const closeMenuBtn = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");
  const openCartBtn = document.getElementById("open-cart");
  const closeCartBtn = document.getElementById("close-cart");
  const cartOverlay = document.getElementById("cart-overlay");

  // Open menu event handler
  openMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.remove("menu--hidden");
  });

  // Close menu event handler
  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("menu--hidden");
  });

  // Open cart event handler
  openCartBtn.addEventListener("click", () => {
    cartOverlay.classList.remove("cart--hidden");
  });

  // Close cart event handler
  closeCartBtn.addEventListener("click", () => {
    cartOverlay.classList.add("cart--hidden");
  });

  // Initialize cart count from localStorage
  initializeCartCount();
}

/**
 * Loads the footer component
 * The footer includes logo, divider, newsletter signup, and legal information
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
          />

          <label for="email" class="visually-hidden">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail address"
            required
            class="footer__input"
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
 * This component displays a selection of featured products in a grid layout
 * that turns into a horizontal scrollable carousel on mobile devices
 *
 * @param {string} containerId - ID of the container to place the component
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
 * Simple fallback to add a product to cart if framCart is not available
 *
 * @param {Object} product - Product to add to the cart
 */
function addProductToCart(product) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Add product to cart
  cart.push(product);

  // Save cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart count
  updateCartCount(cart.length);

  // Update total price
  updateCartTotal(cart);

  // Show feedback
  console.log(`Added ${product.name} to cart`);
}

/**
 * Updates the cart count in the navbar
 *
 * @param {number} count - The number of items in the cart
 */
function updateCartCount(count) {
  const cartButton = document.querySelector(".navbar__cart");
  if (cartButton) {
    cartButton.textContent = count;
  }
}

/**
 * Initialize cart count from localStorage when page loads
 * This ensures the cart counter is always up to date
 */
function initializeCartCount() {
  try {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Update cart counter
    updateCartCount(cart.length);
  } catch (error) {
    console.error("Error initializing cart count:", error);
    updateCartCount(0); // Default to 0 if there's an error
  }
}

/**
 * Updates the cart with new items and persists to localStorage
 * This function is exposed globally for use by other scripts
 *
 * @param {Array} cart - The updated cart array containing product objects
 */
window.updateCart = function (cart) {
  // Save cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart counter
  updateCartCount(cart.length);
};

/**
 * Expose the loadPopularProduce function globally
 * This allows pages to load the component when needed
 */
window.loadPopularProduce = loadPopularProduce;

/**
 * Updates the cart with new items and persists to localStorage
 * This function is exposed globally for use by other scripts
 *
 * @param {Array} cart - The updated cart array containing product objects
 */
window.updateCart = function (cart) {
  // Save cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart counter
  updateCartCount(cart.length);
};

/**
 * Initialize components based on data attributes in the HTML
 * This allows pages to control which components to load
 */
document.addEventListener("DOMContentLoaded", () => {
  // Get page configuration from html tag
  const htmlElement = document.documentElement;
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

/**
 * Updates the cart total
 *
 * @param {Array} cart - The updated cart array containing product objects
 */
function updateCartTotal(cart) {
  const totalElement = document.getElementById("cart-total");
  if (!totalElement) return;

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => {
    return total + item.price * item.quantity; // Assuming quantity is stored in the product object
  }, 0);

  // Update the total price display
  totalElement.textContent = `${totalPrice} kr`;
}
