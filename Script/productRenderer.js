/**
 * productRenderer.js - Product Card Generation Module
 *
 * A centralized module for creating and rendering product cards consistently
 * across the entire Fram Food Delivery website. This refactored version
 * uses HTML templates instead of generating HTML with template literals.
 *
 * @author Charlotte Lockert
 */
window.productRenderer = {
  /**
   * Creates a product card element using the product-card template
   *
   * @param {Object} product - Product data object with all required properties
   * @param {number} product.id - Unique identifier for the product
   * @param {string} product.name - Product name
   * @param {string} product.price - Formatted price (e.g. "45 kr / kg")
   * @param {string} product.quantity - Package size (e.g. "1kg")
   * @param {string} product.image - Path to product image
   * @returns {Promise<HTMLElement>} The created product card element
   */
  createProductCard: async function (product) {
    try {
      // Use the template loader to create a product card
      const productCardFragment =
        await window.templateLoader.createFromTemplate("product-card", {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity || "",
          image: product.image,
        });

      // Return the first element in the fragment
      return productCardFragment.firstElementChild;
    } catch (error) {
      console.error(`Error creating product card for ${product.name}:`, error);

      // Create a fallback product card if template loading fails
      const fallbackCard = document.createElement("div");
      fallbackCard.className = "product-card";
      fallbackCard.dataset.id = product.id;
      fallbackCard.dataset.name = product.name;
      fallbackCard.dataset.price = product.price;
      fallbackCard.dataset.image = product.image;

      fallbackCard.innerHTML = `
        <div class="product-card__info">
          <h3 class="product-card__name">${product.name}</h3>
          <div class="product-card__price">${product.price}</div>
        </div>
      `;
      return fallbackCard;
    }
  },

  /**
   * Displays a grid of products in the specified container
   *
   * @param {Array<Object>} products - Array of product objects
   * @param {HTMLElement} container - Container element for the products grid
   * @returns {Promise<void>}
   */
  displayProducts: async function (products, container) {
    if (!container) return;

    // Clear container
    container.innerHTML = "";

    // Show loading indicator if there are many products
    if (products.length > 5) {
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "products__loading";
      loadingIndicator.innerHTML = `
        <span class="loading-spinner" aria-hidden="true"></span>
        <p>Loading products...</p>
      `;
      container.appendChild(loadingIndicator);
    }

    // Create a fragment for better performance
    const fragment = document.createDocumentFragment();

    // Add products to the fragment
    for (const product of products) {
      try {
        const productCard = await this.createProductCard(product);
        fragment.appendChild(productCard);
      } catch (error) {
        console.error(`Error displaying product ${product.name}:`, error);
      }
    }

    // Clear container again (to remove loading indicator) and add products
    container.innerHTML = "";
    container.appendChild(fragment);
  },

  /**
   * Shows feedback when an item is added to cart
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
