/**
 * cart.js - Cart management functionality for Fram website
 * Handles cart operations, display, and persistence
 */

// Create a global cart object to manage cart functionality
window.framCart = {
  /**
   * Initialize the cart system
   */
  init: function () {
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
    document.addEventListener("click", (event) => {
      if (
        event.target.matches(
          ".product-card__add-to-cart, .product-card__add-to-cart *"
        )
      ) {
        // Find the closest product card
        const productCard = event.target.closest(".product-card");
        if (productCard) {
          // Get product data from the card's data attributes
          const product = {
            id: productCard.dataset.id,
            name: productCard.dataset.name,
            price: productCard.dataset.price,
            image:
              productCard.dataset.image ||
              productCard.querySelector("img")?.src,
          };

          // Add to cart and show the cart overlay
          this.addToCart(product, true);

          // Prevent default action if it's a link
          event.preventDefault();
        }
      }
    });
  },

  /**
   * Add a product to the cart
   * @param {Object} product - Product to add to cart
   * @param {boolean} showCart - Whether to show the cart overlay after adding (default: false)
   */
  addToCart: function (product, showCart = false) {
    // Add product to cart array
    this.items.push(product);

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
    const index = this.items.findIndex((item) => item.id === productId);

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
    // Group items to find the current quantity
    const groupedItems = this.groupCartItems();

    if (groupedItems[productId]) {
      if (change > 0) {
        // Add one more of this product
        this.items.push(groupedItems[productId]);
      } else if (change < 0 && groupedItems[productId].quantity > 1) {
        // Remove one of this product
        const index = this.items.findIndex((item) => item.id === productId);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
      }

      // Save cart to localStorage
      this.saveCart();

      // Render cart items
      this.renderCart();
    }
  },

  /**
   * Group cart items by product ID
   * @returns {Object} Grouped cart items with quantities and subtotals
   */
  groupCartItems: function () {
    const groupedItems = {};

    this.items.forEach((item) => {
      // Extract numeric price from string (e.g., "45 kr / kg" -> 45)
      const priceMatch = item.price.match(/(\\\\d+)/);
      const priceValue = priceMatch ? parseFloat(priceMatch[0]) : 0;

      if (groupedItems[item.id]) {
        // Increment quantity if item already exists
        groupedItems[item.id].quantity += 1;
        groupedItems[item.id].subtotal =
          priceValue * groupedItems[item.id].quantity;
      } else {
        // Add new item to grouped items
        groupedItems[item.id] = {
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

    if (!cartItemsContainer || !cartEmptyContainer || !cartTotalElement) {
      console.error("Cart elements not found in the DOM");
      return;
    }

    // Clear cart items container
    cartItemsContainer.innerHTML = "";

    // Get grouped cart items
    const groupedItems = this.groupCartItems();
    const itemsArray = Object.values(groupedItems);

    // Show/hide empty cart message
    if (itemsArray.length === 0) {
      cartEmptyContainer.style.display = "flex";
      cartItemsContainer.style.display = "none";
    } else {
      cartEmptyContainer.style.display = "none";
      cartItemsContainer.style.display = "flex";

      // Render each cart item
      itemsArray.forEach((item) => {
        const itemElement = this.createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
      });
    }

    // Update total price
    const total = this.calculateTotal();
    cartTotalElement.textContent = `${total} kr`;
  },

  /**
   * Create a DOM element for a cart item
   * @param {Object} item - Cart item object with quantity and subtotal
   * @returns {HTMLElement} Cart item DOM element
   */
  createCartItemElement: function (item) {
    const itemElement = document.createElement("div");
    itemElement.className = "cart__item";

    // Create item HTML structure
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart__item-image">
      <div class="cart__item-details">
        <h3 class="cart__item-name">${item.name}</h3>
        <p class="cart__item-price">${item.price}</p>
        <div class="cart__item-quantity">
          <button class="cart__item-quantity-btn decrease-btn" data-id="${item.id}">-</button>
          <span class="cart__item-quantity-value">${item.quantity}</span>
          <button class="cart__item-quantity-btn increase-btn" data-id="${item.id}">+</button>
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
      this.items = this.items.filter((cartItem) => cartItem.id !== item.id);
      this.saveCart();
      this.renderCart();
    });

    return itemElement;
  },
};

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.framCart.init();
});
