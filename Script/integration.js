/**
 * Integration.js
 * This script ensures proper integration between various components of the FRAM website
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Integration script loaded");

  // Listen for cart update events from framCart
  document.addEventListener("cart:updated", (event) => {
    console.log("Cart updated:", event.detail);

    // You could add additional event handlers here
    // For example, showing a toast notification when an item is added

    if (event.detail.action === "add") {
      showToastNotification(`${event.detail.product.name} added to cart!`);
    }
  });

  // Simple toast notification system
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

  // Ensure product card data attributes are set properly for all product cards
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

  // Initial setup
  setupProductCards();

  // Run setup when new products might be added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        setupProductCards();
      }
    }
  });

  // Observe DOM changes within product grids
  const productGrids = [
    document.getElementById("products-container"),
    document.getElementById("popular-products-grid"),
  ];

  productGrids.forEach((grid) => {
    if (grid) {
      observer.observe(grid, { childList: true, subtree: true });
    }
  });
});
