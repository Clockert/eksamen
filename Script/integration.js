/**
 * integration.js - UI feedback and component integration
 */
document.addEventListener("DOMContentLoaded", () => {
  // Setup product button feedback if produce.js isn't handling it
  if (!window.produceHandlerActive) {
    setupProductButtons();
  }

  // Listen for cart update events
  document.addEventListener("cart:updated", handleCartUpdate);

  /**
   * Setup product buttons
   */
  function setupProductButtons() {
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
      if (window.framCart) {
        window.framCart.addToCart(product, 1);
        showAddedFeedback(addButton);
      }
    });
  }

  /**
   * Handle cart updates
   */
  function handleCartUpdate() {
    // This could show toast notifications or other feedback
    // when the cart is updated from any source
  }

  /**
   * Show feedback when item is added
   */
  function showAddedFeedback(button, quantity = 1) {
    if (!button) return;

    const originalText = button.innerHTML;
    button.innerHTML = `Added! <span class="product-card__icon"><i class="fas fa-check"></i></span>`;
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
   */
  function showToast(message, duration = 3000) {
    let container = document.querySelector(".toast-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";

      Object.assign(container.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999",
      });

      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

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

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }

        if (container.children.length === 0) {
          document.body.removeChild(container);
        }
      }, 300);
    }, duration);
  }
});
