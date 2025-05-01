// Components.js - Modular component loader with cart functionality

/**
 * Loads the navbar component and initializes its functionality
 */
function loadNavbar() {
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
      <button class="navbar__cart">0</button>
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
      <a href="#checkout" class="menu__checkout">Checkout</a>
    </div>
  </div>
`;

  // Insert navbar and menu overlay
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);

  // Setup event listeners once elements exist in the DOM
  const openMenuBtn = document.getElementById("open-menu");
  const closeMenuBtn = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  openMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.remove("menu--hidden");
  });

  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("menu--hidden");
  });

  // Initialize cart count from localStorage
  initializeCartCount();
}

/**
 * Loads the footer component
 */
function loadFooter() {
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
 * Updates the cart count in the navbar
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
 * Exposes cart update function to be used by other scripts
 * @param {Array} cart - The updated cart array
 */
window.updateCart = function (cart) {
  // Save cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update cart counter
  updateCartCount(cart.length);
};

// Load components based on data attributes in the HTML
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
});
