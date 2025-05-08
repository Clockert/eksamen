/**
 * Integration.js
 *
 * This module provides integration between different components of the FRAM website.
 * It handles UI feedback, product interactions, and component coordination.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Integration script loaded");

  // Initialize integrations when DOM is ready
  initializeIntegrations();

  // Set up product cards
  setupProductCards();

  // Legacy function for backward compatibility
  window.updateCart = function (cart) {
    console.warn(
      "window.updateCart is deprecated. Use framCart methods directly."
    );

    if (window.framCart) {
      window.framCart.items = [...cart];
      window.framCart.saveCart();
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
      const cartButton = document.querySelector(".navbar__cart");
      if (cartButton) {
        cartButton.textContent = cart.length;
      }
    }
  };

  // Legacy function for backward compatibility
  window.loadPopularProduce = loadPopularProduce;

  /**
   * Initialize integration components
   */
  function initializeIntegrations() {
    // Set up product button event handlers
    setupProductButtonEvents();

    // Set up notifications for cart events
    setupCartNotifications();

    // Watch for dynamic content changes
    setupDynamicContentObserver();
  }

  /**
   * Set up event handlers for product buttons
   */
  function setupProductButtonEvents() {
    // Skip if produce.js is handling this already
    if (window.produceHandlerActive) return;

    // Use event delegation for add to cart buttons
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(
        ".product-card__add-button, .product-detail__add-to-cart"
      );
      if (!addButton) return;

      event.preventDefault();

      // Get product data
      const productCard = addButton.closest(".product-card");
      const product = {};

      if (productCard) {
        // Get data from product card
        product.id = productCard.dataset.id || addButton.dataset.id;
        product.name =
          productCard.dataset.name ||
          addButton.dataset.name ||
          productCard.querySelector(".product-card__name")?.textContent;
        product.price =
          productCard.dataset.price ||
          addButton.dataset.price ||
          productCard.querySelector(".product-card__price")?.textContent;
        product.image =
          productCard.dataset.image ||
          addButton.dataset.image ||
          productCard.querySelector("img")?.src;
      } else {
        // Get data directly from button (product detail page)
        product.id = addButton.dataset.id;
        product.name =
          addButton.dataset.name ||
          document.getElementById("product-name")?.textContent;
        product.price =
          addButton.dataset.price ||
          document.getElementById("product-price")?.textContent;
        product.image =
          addButton.dataset.image ||
          document.getElementById("product-image")?.src;
      }

      // Get quantity if available (product detail page)
      const quantityInput = document.getElementById("quantity");
      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

      // Add to cart using framCart if available
      if (window.framCart) {
        window.framCart.addToCart(product, quantity, false);
        showAddedToCartFeedback(addButton, quantity);
      } else {
        // Fallback if framCart not available
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        for (let i = 0; i < quantity; i++) {
          cart.push(product);
        }
        localStorage.setItem("cart", JSON.stringify(cart));

        // Update cart count
        const cartButton = document.querySelector(".navbar__cart");
        if (cartButton) {
          cartButton.textContent = cart.length;
        }

        showAddedToCartFeedback(addButton, quantity);
      }
    });
  }

  /**
   * Set up notification listeners for cart events
   */
  function setupCartNotifications() {
    document.addEventListener("cart:updated", (event) => {
      const detail = event.detail;

      // Show notifications based on action type
      if (detail.action === "add") {
        const productName = detail.product?.name || "Product";
        const quantity = detail.quantity || 1;

        if (quantity === 1) {
          showToastNotification(`${productName} added to cart!`);
        } else {
          showToastNotification(`${quantity} ${productName} added to cart!`);
        }
      } else if (detail.action === "remove_all") {
        showToastNotification("Product removed from cart");
      } else if (detail.action === "clear") {
        showToastNotification("Cart has been cleared");
      }
    });
  }

  /**
   * Set up MutationObserver to handle dynamically added content
   */
  function setupDynamicContentObserver() {
    // Watch for new products being added to the page
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          setupProductCards();
        }
      }
    });

    // Observe product containers
    const productGrids = [
      document.getElementById("products-container"),
      document.getElementById("popular-products-grid"),
    ];

    productGrids.forEach((grid) => {
      if (grid) {
        observer.observe(grid, { childList: true, subtree: true });
      }
    });
  }

  /**
   * Set up product cards with proper data attributes
   */
  function setupProductCards() {
    document.querySelectorAll(".product-card").forEach((card) => {
      const addButton = card.querySelector(".product-card__add-button");
      const img = card.querySelector(".product-card__image");
      const nameEl = card.querySelector(".product-card__name");
      const priceEl = card.querySelector(".product-card__price");

      if (addButton) {
        // Ensure button has data attributes from card
        if (card.dataset.id && !addButton.dataset.id) {
          addButton.dataset.id = card.dataset.id;
        }

        if (card.dataset.name || (nameEl && nameEl.textContent)) {
          addButton.dataset.name = card.dataset.name || nameEl.textContent;
        }

        if (card.dataset.price || (priceEl && priceEl.textContent)) {
          addButton.dataset.price = card.dataset.price || priceEl.textContent;
        }

        if (card.dataset.image || (img && img.src)) {
          addButton.dataset.image = card.dataset.image || img.src;
        }
      }
    });
  }

  /**
   * Show feedback when product is added to cart
   * @param {HTMLElement} button - The button that was clicked
   * @param {number} quantity - Quantity added
   */
  function showAddedToCartFeedback(button, quantity = 1) {
    if (!button) return;

    const originalText = button.innerHTML;
    button.innerHTML =
      quantity === 1
        ? `Added! <span class="product-card__icon"><i class="fas fa-check"></i></span>`
        : `Added ${quantity}! <span class="product-card__icon"><i class="fas fa-check"></i></span>`;

    button.disabled = true;
    button.style.backgroundColor = "#28bd6d";

    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
      button.style.backgroundColor = "";
    }, 1500);
  }

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in milliseconds
   */
  function showToastNotification(message, duration = 3000) {
    // Check if a toast container exists, create one if not
    let toastContainer = document.querySelector(".toast-container");

    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";

      // Style the toast container
      Object.assign(toastContainer.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999",
      });

      document.body.appendChild(toastContainer);
    }

    // Create a new toast
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
      backgroundColor: "rgba(40, 189, 109, 0.9)",
      color: "white",
      padding: "12px 20px",
      borderRadius: "4px",
      marginTop: "10px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      maxWidth: "300px",
      fontSize: "14px",
      transition: "opacity 0.3s ease",
    });

    // Add to container
    toastContainer.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }

        // Remove container if empty
        if (toastContainer.children.length === 0) {
          document.body.removeChild(toastContainer);
        }
      }, 300);
    }, duration);
  }

  /**
   * Loads the Popular Produce component and populates it with products
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

    // Get the container element
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element with ID '${containerId}' not found`);
      return;
    }

    // Insert the component HTML
    container.innerHTML = popularProduceHTML;

    // Load products data and display
    fetch("data/products.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Filter for popular products
        const popularProducts = data.products.filter(
          (product) => product.popular
        );
        displayPopularProducts(popularProducts);
      })
      .catch((error) => {
        console.error("Error loading popular products:", error);
        document.getElementById("popular-products-grid").innerHTML = `
          <div class="error-message">
            <p>Sorry, we couldn't load the popular products. Please try again later.</p>
          </div>
        `;
      });
  }

  /**
   * Displays popular products in the grid
   * @param {Array} products - Array of product objects
   */
  function displayPopularProducts(products) {
    const grid = document.getElementById("popular-products-grid");
    if (!grid) {
      console.error("Popular products grid element not found");
      return;
    }

    grid.innerHTML = "";

    products.forEach((product) => {
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

      grid.appendChild(productCard);
    });
  }
});
