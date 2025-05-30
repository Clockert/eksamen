/**
 * cart.js - Refactored Shopping Cart System using Templates
 *
 * This refactored version maintains all cart functionality but uses
 * the template system for HTML structure.
 *
 * @author Charlotte Lockert
 */

/**
 * Main cart object - manages cart data and operations
 * Exposes methods for cart manipulation and uses localStorage for persistence
 */
window.framCart = {
  /** @type {Array<Object>} Contains all cart items */
  items: [],

  /** @type {boolean} Tracks initialization state to prevent duplicate setup */
  _initialized: false,

  /**
   * Initializes the cart system
   * Loads saved cart data from localStorage and sets up event listeners
   *
   * @returns {void}
   */
  init: function () {
    if (this._initialized) return;
    this._initialized = true;

    this.loadCart();
    this.validateCartItems();
    this.setupCartUI();
    this.setupProductButtons();
    this.renderCart(); // Initial render

    console.log("Cart initialized with", this.items.length, "items");
  },

  /**
   * Loads cart data from localStorage
   * Falls back to empty array if no data exists or if parsing fails
   *
   * @returns {void}
   */
  loadCart: function () {
    try {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
      this.validateCartItems();
    } catch (error) {
      console.error("Error loading cart:", error);
      this.items = [];
    }
    this.updateCartCount();
  },

  /**
   * Saves current cart state to localStorage
   * Updates cart count indicator and triggers cart:updated event
   *
   * @returns {void}
   * @fires cart:updated Custom event notifying that cart data has changed
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
   * @param {number|string} product.id - Unique product identifier
   * @param {string} product.name - Product name
   * @param {string|number} product.price - Product price (can be formatted string)
   * @param {string} product.image - URL to product image
   * @param {number} [quantity=1] - Quantity to add, defaults to 1
   * @param {boolean} [showCart=false] - Whether to open cart after adding, defaults to false
   * @returns {void}
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
   * @returns {void}
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
   *
   * @returns {void}
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
   *
   * @returns {void}
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
   * Renders the current cart state to the UI using templates
   * Shows/hides elements based on whether cart is empty
   *
   * @returns {Promise<void>}
   */
  renderCart: async function () {
    const cartOverlay = document.getElementById("cart-overlay");
    if (!cartOverlay) return;

    const cartItems = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const cartSummary = document.querySelector(".cart__summary");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartEmpty || !cartSummary || !cartTotal) return;

    // Handle empty cart state
    if (this.items.length === 0) {
      cartItems.style.display = "none";
      cartEmpty.style.display = "flex";
      cartSummary.style.display = "none";
      return;
    }

    // Show cart items and summary
    cartItems.style.display = "flex";
    cartEmpty.style.display = "none";
    cartSummary.style.display = "block";

    // Clear existing items
    cartItems.innerHTML = "";

    // Add each cart item using templates
    for (const item of this.items) {
      const priceValue = item.priceValue || this.parsePrice(item.price);
      const subtotal = priceValue * item.quantity;

      try {
        // Create cart item from template
        const cartItemElement = await window.templateLoader.createFromTemplate(
          "cart-item",
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            subtotal: subtotal,
          }
        );

        // Add to cart items container
        cartItems.appendChild(cartItemElement);
      } catch (error) {
        console.error(`Error creating cart item for ${item.name}:`, error);
      }
    }

    // Update total
    const total = this.items.reduce((sum, item) => {
      const priceValue = item.priceValue || this.parsePrice(item.price);
      return sum + priceValue * item.quantity;
    }, 0);

    cartTotal.textContent = `${total} kr`;
  },

  /**
   * Sets up the cart UI elements and event listeners
   * Connects to existing cart elements in HTML
   *
   * @returns {void}
   */
  setupCartUI: function () {
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
   *
   * @returns {void}
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
   * @returns {void}
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
   * @param {number} [quantity=1] - Quantity that was added, defaults to 1
   * @returns {void}
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
   *
   * @returns {void}
   */
  openCart: function () {
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) {
      cartOverlay.classList.remove("cart--hidden");
      this.renderCart();
    }
  },

  /**
   * Validates the cart items to ensure data integrity
   * Removes invalid items and resets the cart if corrupted
   *
   * @returns {boolean} True if all items are valid, false otherwise
   */
  validateCartItems: function () {
    if (!Array.isArray(this.items)) {
      console.error("Cart data is corrupted, resetting");

      this.items = [];
      this.saveCart();
      return false;
    }

    // Check for required properties in each item
    let hasInvalidItems = false;
    this.items = this.items.filter((item) => {
      const isValid =
        item &&
        typeof item.id !== "undefined" &&
        typeof item.name === "string" &&
        item.name.trim() !== "";

      if (!isValid) hasInvalidItems = true;
      return isValid;
    });

    if (hasInvalidItems) {
      console.warn("Some invalid items were removed from cart");
      this.saveCart();
    }

    return true;
  },
};

// Initialize cart when templates are loaded
document.addEventListener("templates-loaded", () => {
  if (!window.framCart._initialized) {
    window.framCart.init();
  }
});

// Fallback initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit to ensure templates have a chance to load
  setTimeout(() => {
    if (!window.framCart._initialized) {
      console.warn("Initializing cart without waiting for templates");
      window.framCart.init();
    }
  }, 500);
});
