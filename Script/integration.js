/**
 * integration.js - UI feedback and component integration
 */
document.addEventListener("DOMContentLoaded", () => {
  // Listen for cart update events
  document.addEventListener("cart:updated", handleCartUpdate);

  /**
   * Handle cart updates
   */
  function handleCartUpdate() {
    // This could show toast notifications or other feedback
    // when the cart is updated from any source
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

  // Export functions for use in other modules
  window.showToast = showToast;
});
