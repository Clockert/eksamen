/**
 * productRenderer.js
 * Centralized module for rendering product cards consistently across the site
 */
window.productRenderer = {
  /**
   * Creates a product card element with consistent design and functionality
   *
   * @param {Object} product - Product data object
   * @returns {HTMLElement} The created product card element
   */
  createProductCard: function (product) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.dataset.id = product.id;
    productCard.dataset.name = product.name;
    productCard.dataset.price = product.price;
    productCard.dataset.image = product.image;

    productCard.innerHTML = `
      <div class="product-card__image-container">
        <a href="product-detail.html?id=${product.id}" class="product-card__link">
          <img src="${product.image}" alt="${product.name}" class="product-card__image">
        </a>
        <button class="product-card__add-button" 
                aria-label="Add ${product.name} to cart"
                data-id="${product.id}"
                data-name="${product.name}"
                data-price="${product.price}"
                data-image="${product.image}">
          Add to basket
          <span class="product-card__icon"><i class="fas fa-arrow-up"></i></span>
        </button>
      </div>
      <div class="product-card__info">
        <div class="product-card__header">
          <h3 class="product-card__name">
            <a href="product-detail.html?id=${product.id}" class="product-card__link">${product.name}</a>
          </h3>
          <div class="product-card__price">${product.price}</div>
        </div>
        <p class="product-card__quantity">${product.quantity}</p>
      </div>
    `;

    // Add event listener to Add to Cart button
    const addToCartBtn = productCard.querySelector(".product-card__add-button");
    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Add product to cart
      if (window.framCart && window.framCart.addToCart) {
        window.framCart.addToCart(product);
        this.showAddedFeedback(addToCartBtn);
      }
    });

    return productCard;
  },

  /**
   * Displays a grid of products in the specified container
   *
   * @param {Array} products - Array of product objects
   * @param {HTMLElement} container - Container element for the products grid
   */
  displayProducts: function (products, container) {
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Add product cards
    products.forEach((product) => {
      const productCard = this.createProductCard(product);
      container.appendChild(productCard);
    });
  },

  /**
   * Shows feedback when an item is added to cart
   *
   * @param {HTMLElement} button - The button that was clicked
   * @param {number} quantity - Quantity added to cart
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
};
