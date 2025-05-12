/**
 * productRenderer.js
 *
 * A centralized module for creating and rendering product cards consistently
 * across the entire Fram Food Delivery website.
 *
 * This module provides functions to:
 * - Create standardized product card elements
 * - Display collections of products in grid layouts
 * - Show feedback when products are added to cart
 *
 * By using this shared renderer, we ensure consistent product presentation
 * and behavior throughout the site while keeping code DRY.
 *
 * @author Clockert
 */
window.productRenderer = {
  /**
   * Creates a product card element with consistent design and functionality
   *
   * This method generates the full HTML structure for a product card including:
   * - Product image with link to detail page
   * - Add to cart button with data attributes
   * - Product name, price and quantity information
   *
   * @param {Object} product - Product data object with all required properties
   * @param {number} product.id - Unique identifier for the product
   * @param {string} product.name - Product name
   * @param {string} product.price - Formatted price (e.g. "45 kr / kg")
   * @param {string} product.quantity - Package size (e.g. "1kg")
   * @param {string} product.image - Path to product image
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

    return productCard;
  },

  /**
   * Displays a grid of products in the specified container
   *
   * This method clears the container and populates it with product cards
   * created from the provided product data array. Used for both the main
   * product listing page and the popular products section.
   *
   * @param {Array<Object>} products - Array of product objects
   * @param {HTMLElement} container - Container element for the products grid
   * @returns {void}
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
   * Temporarily changes the button's appearance and text to indicate
   * successful addition to cart, then reverts after a delay.
   *
   * @param {HTMLElement} button - The button element that was clicked
   * @param {number} [quantity=1] - Quantity added to cart, defaults to 1
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

    // Restore the button to its original state after 1.5 seconds
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      button.style.backgroundColor = "";
    }, 1500);
  },
};
