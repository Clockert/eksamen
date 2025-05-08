/**
 * cart.js - Cart management functionality for Fram website
 * Handles cart operations, display, and persistence
 */

// Create a global cart object to manage cart functionality
window.framCart = {
  items: [], // Cart items
  clickHandled: false, // Track if click is already being handled

  /**
   * Initialize the cart system
   */
  init: function () {
    // Only initialize once
    if (this._initialized) return;
    this._initialized = true;

    console.log("Initializing framCart");

    // Load cart from localStorage
    this.loadCart();

    // Initialize event listeners
    this.initEventListeners();

    // Render cart items
    this.renderCart();
  },

  /**
   * Load cart data from localStorage
   */
  loadCart: function () {
    try {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      this.items = [];
    }

    // Update cart count in navbar
    this.updateCartCount();
  },

  /**
   * Save cart data to localStorage
   */
  saveCart: function () {
    localStorage.setItem("cart", JSON.stringify(this.items));

    // Update cart count in navbar
    this.updateCartCount();
  },

  /**
   * Update the cart count in the navbar
   */
  updateCartCount: function () {
    const cartButton = document.querySelector(".navbar__cart");
    if (cartButton) {
      cartButton.textContent = this.items.length;
    }
  },

  /**
   * Initialize event listeners for cart functionality
   */
  initEventListeners: function () {
    // Cart overlay elements
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");
    const openCartBtn = document.querySelector(".navbar__cart");

    if (openCartBtn) {
      openCartBtn.addEventListener("click", () => {
        cartOverlay.classList.remove("cart--hidden");
        this.renderCart(); // Re-render cart when opened
      });
    }

    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", () => {
        cartOverlay.classList.add("cart--hidden");
      });
    }

    // Use event delegation for dynamically added "Add to basket" buttons
    // IMPORTANT FIX: Check if the produce.js event handler is already active
    // Only add this event listener if we don't detect the other handler
    if (!window.produceHandlerActive) {
      document.addEventListener("click", (event) => {
        // Skip if the click is already being handled
        if (this.clickHandled) return;

        // Find the closest button or its child elements
        const addButton = event.target.closest(
          ".product-card__add-button, .product-detail__add-to-cart"
        );

        if (addButton) {
          this.clickHandled = true;

          // Prevent default action if it's a link
          event.preventDefault();

          // Find the product data
          const productCard = addButton.closest(".product-card");
          let product;

          if (productCard) {
            // Get product data from the card's data attributes
            product = {
              id: productCard.dataset.id || addButton.dataset.id,
              name: productCard.dataset.name || addButton.dataset.name,
              price: productCard.dataset.price || addButton.dataset.price,
              image:
                productCard.dataset.image ||
                addButton.dataset.image ||
                productCard.querySelector("img")?.src,
            };

            // Add to cart
            this.addToCart(product, 1, true);

            // Show feedback
            this.showAddedToCartFeedback(addButton, 1);
          } else if (
            addButton.classList.contains("product-detail__add-to-cart")
          ) {
            // Handle product detail page add button
            const quantityInput = document.getElementById("quantity");
            const quantity = quantityInput
              ? parseInt(quantityInput.value) || 1
              : 1;

            product = {
              id: addButton.dataset.id,
              name: document.getElementById("product-name")?.textContent,
              price: document.getElementById("product-price")?.textContent,
              image: document.getElementById("product-image")?.src,
            };

            this.addToCart(product, quantity, true);

            // Show feedback
            this.showAddedToCartFeedback(addButton, quantity);
          }

          // Reset click handled flag after a delay
          setTimeout(() => {
            this.clickHandled = false;
          }, 100);
        }
      });
    }
  },

  /**
   * Show feedback when product is added to cart
   * @param {HTMLElement} button - The button that was clicked
   * @param {number} quantity - Quantity added
   */
  showAddedToCartFeedback: function (button, quantity) {
    if (!button) return;

    const originalText = button.innerHTML;
    button.innerHTML = `Added ${quantity}! <span class="product-card__icon"><i class="fas fa-check"></i></span>`;
    button.disabled = true;
    button.style.backgroundColor = "#28bd6d";

    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      button.style.backgroundColor = "";
    }, 1500);
  },

  /**
   * Add a product to the cart
   * @param {Object} product - Product to add to cart
   * @param {number} quantity - Quantity to add (default: 1)
   * @param {boolean} showCart - Whether to show the cart overlay after adding (default: false)
   */
  addToCart: function (product, quantity = 1, showCart = false) {
    if (!product || !product.id) {
      console.error("Invalid product data:", product);
      return;
    }

    // Ensure numeric properties
    product.id = parseInt(product.id) || 0;

    // Extract numeric price from string if needed (e.g., "45 kr / kg" -> 45)
    if (typeof product.price === "string") {
      const priceMatch = product.price.match(/(\d+)/);
      product.priceValue = priceMatch ? parseFloat(priceMatch[0]) : 0;
    }

    // Add product to cart array multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      this.items.push(product);
    }

    // Save cart to localStorage
    this.saveCart();

    // Render cart items
    this.renderCart();

    // Show cart overlay if requested
    if (showCart) {
      const cartOverlay = document.getElementById("cart-overlay");
      if (cartOverlay) {
        cartOverlay.classList.remove("cart--hidden");
      }
    }

    // Dispatch custom event for other components to react
    document.dispatchEvent(
      new CustomEvent("cart:updated", {
        detail: {
          items: this.items,
          action: "add",
          product: product,
          quantity: quantity,
        },
      })
    );
  },

  /**
   * Remove a product from the cart
   * @param {number} productId - ID of product to remove
   */
  removeFromCart: function (productId) {
    // Find the index of the first occurrence of the product
    const index = this.items.findIndex(
      (item) => parseInt(item.id) === parseInt(productId)
    );

    // Remove the product if found
    if (index !== -1) {
      const removedProduct = this.items[index];
      this.items.splice(index, 1);

      // Save cart to localStorage
      this.saveCart();

      // Render cart items
      this.renderCart();

      // Dispatch custom event for other components to react
      document.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: {
            items: this.items,
            action: "remove",
            product: removedProduct,
          },
        })
      );
    }
  },

  /**
   * Update quantity of a product in the cart
   * @param {number} productId - ID of product to update
   * @param {number} change - Amount to change quantity by (+1 or -1)
   */
  updateQuantity: function (productId, change) {
    // Convert to number to ensure proper comparison
    productId = parseInt(productId);

    if (change > 0) {
      // Find a product with the same ID
      const productToAdd = this.items.find(
        (item) => parseInt(item.id) === productId
      );
      if (productToAdd) {
        // Add one more of this product
        this.items.push({ ...productToAdd });
      }
    } else if (change < 0) {
      // Find index of product to remove
      const indexToRemove = this.items.findIndex(
        (item) => parseInt(item.id) === productId
      );
      if (indexToRemove !== -1) {
        // Remove one of this product
        this.items.splice(indexToRemove, 1);
      }
    }

    // Save cart to localStorage
    this.saveCart();

    // Render cart items
    this.renderCart();

    // Dispatch event
    document.dispatchEvent(
      new CustomEvent("cart:updated", {
        detail: {
          items: this.items,
          action: "update",
          productId: productId,
          change: change,
        },
      })
    );
  },

  /**
   * Group cart items by product ID
   * @returns {Object} Grouped cart items with quantities and subtotals
   */
  groupCartItems: function () {
    const groupedItems = {};

    this.items.forEach((item) => {
      // Make sure id is treated as a number
      const itemId = parseInt(item.id);

      // Extract numeric price from string (e.g., "45 kr / kg" -> 45)
      let priceValue = item.priceValue; // Use cached priceValue if available

      if (priceValue === undefined && typeof item.price === "string") {
        const priceMatch = item.price.match(/(\d+)/);
        priceValue = priceMatch ? parseFloat(priceMatch[0]) : 0;
        // Cache for future use
        item.priceValue = priceValue;
      }

      if (groupedItems[itemId]) {
        // Increment quantity if item already exists
        groupedItems[itemId].quantity += 1;
        groupedItems[itemId].subtotal =
          priceValue * groupedItems[itemId].quantity;
      } else {
        // Add new item to grouped items
        groupedItems[itemId] = {
          ...item,
          quantity: 1,
          priceValue: priceValue,
          subtotal: priceValue,
        };
      }
    });

    return groupedItems;
  },

  /**
   * Calculate the total price of all items in the cart
   * @returns {number} Total price
   */
  calculateTotal: function () {
    const groupedItems = this.groupCartItems();
    let total = 0;

    // Sum up subtotals of all items
    Object.values(groupedItems).forEach((item) => {
      total += item.subtotal;
    });

    return total;
  },

  /**
   * Render cart items in the cart overlay
   */
  renderCart: function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartEmptyContainer = document.getElementById("cart-empty");
    const cartTotalElement = document.getElementById("cart-total");
    const cartSummary = document.querySelector(".cart__summary");

    if (!cartItemsContainer || !cartEmptyContainer) {
      console.error("Cart elements not found in the DOM");
      return;
    }

    // Clear cart items container
    cartItemsContainer.innerHTML = "";

    // Get grouped cart items
    const groupedItems = this.groupCartItems();
    const itemsArray = Object.values(groupedItems);

    // Show/hide empty cart message and summary
    if (itemsArray.length === 0) {
      cartEmptyContainer.style.display = "flex";
      cartItemsContainer.style.display = "none";
      if (cartSummary) cartSummary.style.display = "none";
    } else {
      cartEmptyContainer.style.display = "none";
      cartItemsContainer.style.display = "flex";
      if (cartSummary) cartSummary.style.display = "block";

      // Render each cart item
      itemsArray.forEach((item) => {
        const itemElement = this.createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
      });
    }

    // Update total price
    if (cartTotalElement) {
      const total = this.calculateTotal();
      cartTotalElement.textContent = `${total} kr`;
    }
  },

  /**
   * Create a DOM element for a cart item
   * @param {Object} item - Cart item object with quantity and subtotal
   * @returns {HTMLElement} Cart item DOM element
   */
  createCartItemElement: function (item) {
    const itemElement = document.createElement("div");
    itemElement.className = "cart__item";
    itemElement.dataset.id = item.id;

    // Create item HTML structure
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart__item-image">
      <div class="cart__item-details">
        <h3 class="cart__item-name">${item.name}</h3>
        <p class="cart__item-price">${item.price}</p>
        <div class="cart__item-quantity">
          <button class="cart__item-quantity-btn decrease-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
          <span class="cart__item-quantity-value">${item.quantity}</span>
          <button class="cart__item-quantity-btn increase-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
          <button class="cart__item-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
      <div class="cart__item-subtotal">${item.subtotal} kr</div>
    `;

    // Add event listeners for quantity buttons and remove button
    const decreaseBtn = itemElement.querySelector(".decrease-btn");
    const increaseBtn = itemElement.querySelector(".increase-btn");
    const removeBtn = itemElement.querySelector(".cart__item-remove");

    decreaseBtn.addEventListener("click", () => {
      this.updateQuantity(item.id, -1);
    });

    increaseBtn.addEventListener("click", () => {
      this.updateQuantity(item.id, 1);
    });

    removeBtn.addEventListener("click", () => {
      // Remove all instances of this product
      this.items = this.items.filter(
        (cartItem) => parseInt(cartItem.id) !== parseInt(item.id)
      );
      this.saveCart();
      this.renderCart();
    });

    return itemElement;
  },

  /**
   * Clear the entire cart
   */
  clearCart: function () {
    this.items = [];
    this.saveCart();
    this.renderCart();

    document.dispatchEvent(
      new CustomEvent("cart:updated", {
        detail: {
          items: this.items,
          action: "clear",
        },
      })
    );
  },
};

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Use a short timeout to ensure we initialize only once,
  // and to let any other scripts load first
  setTimeout(() => {
    if (window.framCart && !window.framCart._initialized) {
      window.framCart.init();
    }
  }, 50);
});
