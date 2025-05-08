/**
 * cart.js - Core cart data management
 */
window.framCart = {
  items: [],
  _initialized: false,

  init: function () {
    if (this._initialized) return;
    this._initialized = true;

    this.loadCart();
    this.setupCartUI();

    console.log("Cart initialized with", this.items.length, "items");
  },

  loadCart: function () {
    try {
      this.items = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
      console.error("Error loading cart:", error);
      this.items = [];
    }
    this.updateCartCount();
  },

  saveCart: function () {
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.updateCartCount();

    // Simple event for other components
    document.dispatchEvent(new CustomEvent("cart:updated"));
  },

  addToCart: function (product, quantity = 1, showCart = false) {
    if (!product || !product.id) return;

    // Add multiple copies based on quantity
    for (let i = 0; i < quantity; i++) {
      this.items.push({ ...product });
    }

    this.saveCart();
    this.renderCart();

    if (showCart) {
      const cartOverlay = document.getElementById("cart-overlay");
      if (cartOverlay) cartOverlay.classList.remove("cart--hidden");
    }
  },

  removeFromCart: function (productId) {
    const index = this.items.findIndex(
      (item) => parseInt(item.id) === parseInt(productId)
    );
    if (index !== -1) {
      this.items.splice(index, 1);
      this.saveCart();
      this.renderCart();
    }
  },

  clearCart: function () {
    this.items = [];
    this.saveCart();
    this.renderCart();
  },

  updateCartCount: function () {
    const cartButton = document.querySelector(".navbar__cart");
    if (cartButton) cartButton.textContent = this.items.length;
  },

  // Basic cart UI functions
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

        if (target.closest(".decrease-btn")) {
          this.removeFromCart(target.closest(".decrease-btn").dataset.id);
        } else if (target.closest(".increase-btn")) {
          const productId = target.closest(".increase-btn").dataset.id;
          const product = this.items.find(
            (item) => parseInt(item.id) === parseInt(productId)
          );
          if (product) this.addToCart(product);
        } else if (target.closest(".cart__item-remove")) {
          const productId = target.closest(".cart__item-remove").dataset.id;

          // Remove all instances of this product
          this.items = this.items.filter(
            (item) => parseInt(item.id) !== parseInt(productId)
          );

          this.saveCart();
          this.renderCart();
        }
      });
    }
  },

  // Render cart UI
  renderCart: function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartEmptyContainer = document.getElementById("cart-empty");
    const cartTotalElement = document.getElementById("cart-total");
    const cartSummary = document.querySelector(".cart__summary");

    if (!cartItemsContainer || !cartEmptyContainer) return;

    // Group items by product ID
    const groupedItems = {};
    this.items.forEach((item) => {
      const id = parseInt(item.id);
      if (!groupedItems[id]) {
        groupedItems[id] = { ...item, quantity: 1 };
      } else {
        groupedItems[id].quantity += 1;
      }
    });

    // Convert to array
    const itemsArray = Object.values(groupedItems);

    // Show/hide empty cart message
    if (itemsArray.length === 0) {
      cartEmptyContainer.style.display = "flex";
      cartItemsContainer.style.display = "none";
      if (cartSummary) cartSummary.style.display = "none";
    } else {
      cartEmptyContainer.style.display = "none";
      cartItemsContainer.style.display = "flex";
      if (cartSummary) cartSummary.style.display = "block";

      // Clear container
      cartItemsContainer.innerHTML = "";

      // Render items
      itemsArray.forEach((item) => {
        // Calculate subtotal
        const price = parseInt(item.price) || 0;
        const subtotal = price * item.quantity;

        // Create item element
        const itemEl = document.createElement("div");
        itemEl.className = "cart__item";
        itemEl.dataset.id = item.id;

        itemEl.innerHTML = `
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
          <div class="cart__item-subtotal">${subtotal} kr</div>
        `;

        cartItemsContainer.appendChild(itemEl);
      });

      // Update total
      if (cartTotalElement) {
        const total = itemsArray.reduce((sum, item) => {
          const price = parseInt(item.price) || 0;
          return sum + price * item.quantity;
        }, 0);

        cartTotalElement.textContent = `${total} kr`;
      }
    }
  },
};

// Initialize cart
document.addEventListener("DOMContentLoaded", () => {
  if (!window.framCart._initialized) {
    window.framCart.init();
  }
});
