/**
 * cart.js - Shopping cart system for Fram Food Delivery
 *
 * This module handles all cart-related functionality including:
 * - Adding and removing products
 * - Updating quantities
 * - Calculating totals
 * - Persisting cart data between sessions
 * - Rendering cart UI elements
 *
 * The cart uses localStorage for persistence and custom events for cross-component communication.
 *
 * @author Clockert

 */

// Cart overlay HTML structure - defines the cart UI that will be injected into the DOM
const cartOverlayHTML = `
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

/**
 * Main cart object - manages cart data and operations
 * Exposes methods for cart manipulation and uses localStorage for persistence
 */
window.framCart = {
  /** @type {Array} Contains all cart items */
  items: [],

  /** @type {boolean} Tracks initialization state to prevent duplicate setup */
  _initialized: false,

  /**
   * Initializes the cart system
   * Loads saved cart data from localStorage and sets up event listeners
   */
  init: function () {
    if (this._initialized) return;
    this._initialized = true;

    this.loadCart();
    this.setupCartUI();
    this.setupProductButtons();
    this.renderCart(); // Initial render

    console.log("Cart initialized with", this.items.length, "items");
  },

  /**
   * Loads cart data from localStorage
   * Falls back to empty array if no data exists or if parsing fails
   */
  loadCart: function () {
    try {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
      console.error("Error loading cart:", error);
      this.items = [];
    }
    this.updateCartCount();
  },

  /**
   * Saves current cart state to localStorage
   * Updates cart count indicator and triggers cart:updated event
   */
  saveCart: function () {
    try {
      localStorage.setItem("cart", JSON.stringify(this.items));
      this.updateCartCount();
      document.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  },

  /**
   * Parses price strings into numeric values
   * Handles both number input and string formats like "45 kr"
   *
   * @param {string|number} price - The price to parse
   * @returns {number} The numeric price value
   */
  parsePrice: function (price) {
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      // Extract numeric value from price string (e.g., "45 kr" -> 45)
      const match = price.match(/(\d+)/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  },

  /**
   * Adds a product to the cart
   * If product already exists in cart, increases quantity instead
   *
   * @param {Object} product - Product object with id, name, price, and image
   * @param {number} quantity - Quantity to add, defaults to 1
   * @param {boolean} showCart - Whether to open cart after adding, defaults to false
   */
  addToCart: function (product, quantity = 1, showCart = false) {
    if (!product || !product.id) {
      console.error("Invalid product data");
      return;
    }

    try {
      const existingProductIndex = this.items.findIndex(
        (item) => parseInt(item.id) === parseInt(product.id)
      );

      if (existingProductIndex !== -1) {
        // If the product exists, update the quantity
        this.items[existingProductIndex].quantity =
          (this.items[existingProductIndex].quantity || 0) + quantity;
      } else {
        // If it doesn't exist, add it with the specified quantity
        this.items.push({
          ...product,
          quantity: quantity,
          priceValue: this.parsePrice(product.price), // Store numeric price value
        });
      }

      this.saveCart();
      this.updateCartCount();
      this.renderCart();

      if (showCart) {
        this.openCart();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  },

  /**
   * Removes a product from the cart completely
   *
   * @param {string|number} productId - ID of the product to remove
   */
  removeFromCart: function (productId) {
    const index = this.items.findIndex(
      (item) => parseInt(item.id) === parseInt(productId)
    );

    if (index !== -1) {
      this.items.splice(index, 1);
      this.saveCart();
      this.renderCart();
      this.showFeedback("Item removed from cart");
    }
  },

  /**
   * Empties the entire cart
   */
  clearCart: function () {
    this.items = [];
    this.saveCart();
    this.renderCart();
    this.showFeedback("Cart cleared");
  },

  /**
   * Updates the cart count indicator in the navbar
   * Sums up quantities of all items
   */
  updateCartCount: function () {
    const cartButton = document.querySelector(".navbar__cart");
    if (cartButton) {
      const totalQuantity = this.items.reduce((total, item) => {
        return total + (item.quantity || 1);
      }, 0);

      cartButton.textContent = totalQuantity;
    }
  },

  /**
   * Renders the current cart state to the UI
   * Shows/hides elements based on whether cart is empty
   */
  renderCart: function () {
    const cartOverlay = document.getElementById("cart-overlay");
    if (!cartOverlay) return;

    const cartItems = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const cartSummary = document.querySelector(".cart__summary");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartEmpty || !cartSummary || !cartTotal) return;

    if (this.items.length === 0) {
      cartItems.style.display = "none";
      cartEmpty.style.display = "flex";
      cartSummary.style.display = "none";
      return;
    }

    cartItems.style.display = "flex";
    cartEmpty.style.display = "none";
    cartSummary.style.display = "block";

    cartItems.innerHTML = this.items
      .map((item) => {
        const priceValue = item.priceValue || this.parsePrice(item.price);
        const subtotal = priceValue * item.quantity;
        return `
          <div class="cart__item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart__item-image" />
            <div class="cart__item-details">
              <h3 class="cart__item-name">${item.name}</h3>
              <p class="cart__item-price">${item.price}</p>
              <p class="cart__item-quantity">Quantity: ${item.quantity}</p>
              <p class="cart__item-subtotal">Subtotal: ${subtotal} kr</p>
            </div>
            <button class="cart__item-remove" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      })
      .join("");

    // Update total
    const total = this.items.reduce((sum, item) => {
      const priceValue = item.priceValue || this.parsePrice(item.price);
      return sum + priceValue * item.quantity;
    }, 0);
    cartTotal.textContent = `${total} kr`;
  },

  /**
   * Sets up the cart UI elements and event listeners
   * Injects cart overlay HTML if not already present
   */
  setupCartUI: function () {
    // Insert cart overlay into the DOM if it doesn't exist
    if (!document.getElementById("cart-overlay")) {
      document.body.insertAdjacentHTML("beforeend", cartOverlayHTML);
    }

    // Cart open/close listeners
    const openCartBtn = document.querySelector(".navbar__cart");
    const closeCartBtn = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");

    if (openCartBtn && cartOverlay) {
      openCartBtn.addEventListener("click", () => {
        cartOverlay.classList.remove("cart--hidden");
        this.renderCart();
      });
    }

    if (closeCartBtn && cartOverlay) {
      closeCartBtn.addEventListener("click", () => {
        cartOverlay.classList.add("cart--hidden");
      });
    }

    // Cart item event delegation
    const cartItems = document.getElementById("cart-items");
    if (cartItems) {
      cartItems.addEventListener("click", (e) => {
        const target = e.target;

        if (target.closest(".cart__item-remove")) {
          const id = target.closest(".cart__item-remove").dataset.id;
          this.removeFromCart(id);
        }
      });
    }
  },

  /**
   * Sets up event listeners for product "Add to cart" buttons
   * Uses event delegation for better performance
   */
  setupProductButtons: function () {
    // Remove any existing event listeners
    const oldHandler = document.querySelector(".product-card__add-button");
    if (oldHandler) {
      oldHandler.removeEventListener("click", this.handleAddToCart);
    }

    // Handle product card add buttons
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(".product-card__add-button");
      if (!addButton) return;

      event.preventDefault();

      // Get product data
      const productCard = addButton.closest(".product-card");
      if (!productCard) return;

      const product = {
        id: parseInt(productCard.dataset.id || addButton.dataset.id),
        name: productCard.dataset.name || addButton.dataset.name,
        price: productCard.dataset.price || addButton.dataset.price,
        image: productCard.dataset.image || addButton.dataset.image,
      };

      // Add to cart
      this.addToCart(product, 1);
      this.showAddedFeedback(addButton);
    });

    // Handle product detail add button
    const addToCartDetailButton = document.getElementById("add-to-cart-detail");
    if (addToCartDetailButton) {
      // Remove any existing event listeners
      const newButton = addToCartDetailButton.cloneNode(true);
      addToCartDetailButton.parentNode.replaceChild(
        newButton,
        addToCartDetailButton
      );

      newButton.addEventListener("click", () => {
        const quantityInput = document.getElementById("quantity");
        const quantity = parseInt(quantityInput.value) || 1;

        if (quantity <= 0) {
          quantityInput.value = 1;
          return;
        }

        const product = {
          id: parseInt(newButton.dataset.id),
          name: newButton.dataset.name,
          price: newButton.dataset.price,
          image: newButton.dataset.image,
        };

        this.addToCart(product, quantity, true);
        this.showAddedFeedback(newButton, quantity);
      });
    }
  },

  /**
   * Shows feedback message to users
   *
   * @param {string} message - The message to display
   */
  showFeedback: function (message) {
    // Create feedback element if it doesn't exist
    let feedback = document.getElementById("cart-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.id = "cart-feedback";
      feedback.className = "cart-feedback";
      document.body.appendChild(feedback);
    }

    // Show message
    feedback.textContent = message;
    feedback.classList.add("cart-feedback--visible");

    // Hide after 2 seconds
    setTimeout(() => {
      feedback.classList.remove("cart-feedback--visible");
    }, 2000);
  },

  /**
   * Shows visual feedback when item is added to cart
   * Temporarily changes button appearance
   *
   * @param {HTMLElement} button - The button element that was clicked
   * @param {number} quantity - Quantity that was added, defaults to 1
   */
  showAddedFeedback: function (button, quantity = 1) {
    if (!button) return;

    // Store the original button text
    const originalText = button.textContent || "Add to basket";

    // Set the success message with quantity
    button.innerHTML =
      quantity === 1
        ? `Added! <i class="fas fa-check"></i>`
        : `Added ${quantity}! <i class="fas fa-check"></i>`;

    button.disabled = true;
    button.style.backgroundColor = "#28bd6d";

    setTimeout(() => {
      // Restore the button to its original state
      button.innerHTML = originalText;
      button.disabled = false;
      button.style.backgroundColor = "";
    }, 1500);
  },

  /**
   * Opens the cart overlay
   * Public method that can be called from other components
   */
  openCart: function () {
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) {
      cartOverlay.classList.remove("cart--hidden");
      this.renderCart();
    }
  },
};

// Initialize cart when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (!window.framCart._initialized) {
    window.framCart.init();
  }
});
