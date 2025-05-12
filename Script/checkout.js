/**
 * Checkout.js - Manages the checkout process functionality
 *
 * This module handles all checkout-related functionality including:
 * - Loading cart items in the order summary
 * - Calculating subtotals, delivery costs, and order totals
 * - Validating form inputs before submission
 * - Handling order submission
 * - Displaying confirmation messages
 *
 * The checkout process connects to the cart system, displays the current
 * order, validates customer information, and simulates order submission.
 *
 * @author Clockert
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const checkoutItems = document.getElementById("checkout-items");
  const subtotalElement = document.getElementById("subtotal-amount");
  const deliveryElement = document.getElementById("delivery-amount");
  const totalElement = document.getElementById("total-amount");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmationModal = document.getElementById("confirmation-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const orderNumberElement = document.getElementById("order-number");
  const confirmationEmailElement =
    document.getElementById("confirmation-email");
  const deliveryDateElement = document.getElementById("delivery-date");

  // Constants
  const DELIVERY_FEE = 49; // 49 kr delivery fee

  // Initialize
  init();

  /**
   * Initialize the checkout page
   * Sets up event listeners and loads cart data
   *
   * @returns {void}
   */
  function init() {
    console.log("Initializing checkout page");
    // Wait a bit to ensure framCart has initialized
    setTimeout(() => {
      // Load cart items from localStorage
      loadCheckoutItems();
    }, 200);

    // Set up event listeners
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleSubmitOrder);
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        confirmationModal.classList.add("modal--hidden");
      });
    }

    // Listen for cart updates
    document.addEventListener("cart:updated", () => {
      loadCheckoutItems();
    });
  }

  /**
   * Checks if shopping cart has items
   * @returns {boolean} True if cart is empty
   */
  function isCartEmpty() {
    if (window.framCart && window.framCart.items) {
      return window.framCart.items.length === 0;
    }

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      return cart.length === 0;
    } catch (e) {
      console.error("Error checking cart:", e);
      return true;
    }
  }

  /**
   * Shows error message and scrolls into view
   * @param {string} message - Error message to display
   */
  function showCheckoutError(message) {
    let errorContainer = document.getElementById("checkout-error");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.id = "checkout-error";
      errorContainer.className =
        "checkout__error-message checkout__error-container";
      errorContainer.setAttribute("role", "alert");
      checkoutForm.insertBefore(errorContainer, checkoutForm.firstChild);
    }

    errorContainer.textContent = message;
    errorContainer.classList.add("visible");

    errorContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }

  /**
   * Load cart items and display them in the checkout summary
   * Gets cart data from framCart or localStorage and renders items
   *
   * @returns {void}
   */
  function loadCheckoutItems() {
    console.log("Loading checkout items");

    if (isCartEmpty()) {
      showCheckoutError(
        "Your cart is empty. Please add items before checking out."
      );
      checkoutItems.innerHTML = `
        <div class="checkout__empty-state">
          <p>Your cart is empty</p>
          <a href="produce.html" class="btn btn--primary">Browse Products</a>
        </div>
      `;
      updateTotals(0);
      return;
    }

    // Get cart items - try different approaches
    let cartItems = [];

    // First try from framCart if it exists and is initialized
    if (
      window.framCart &&
      window.framCart.items &&
      window.framCart.items.length > 0
    ) {
      console.log("Using framCart.items");
      cartItems = window.framCart.items;
    }
    // Then try framCart's grouping method if available
    else if (
      window.framCart &&
      typeof window.framCart.groupCartItems === "function"
    ) {
      console.log("Using framCart.groupCartItems()");
      const groupedItems = window.framCart.groupCartItems();
      cartItems = Object.values(groupedItems);
    }
    // Fall back to localStorage
    else {
      console.log("Using localStorage");
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          cartItems = JSON.parse(storedCart);
          console.log("Parsed from localStorage:", cartItems);
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }

    console.log("Cart items loaded:", cartItems);

    // Clear checkout items container
    if (checkoutItems) {
      checkoutItems.innerHTML = "";
    }

    // If cart is empty, show message
    if (!cartItems || cartItems.length === 0) {
      console.log("Cart is empty");
      if (checkoutItems) {
        checkoutItems.innerHTML = `
          <div class="checkout__empty">
            <p>Your cart is empty. Please add some products before checkout.</p>
            <a href="produce.html" class="checkout__continue-shopping">Browse Products</a>
          </div>
        `;
      }
      updateTotals(0);
      return;
    }

    // Group cart items by product ID to consolidate quantities
    console.log("Grouping cart items");
    const groupedItems = {};

    cartItems.forEach((item) => {
      const itemId = parseInt(item.id);

      // Extract numeric price from string (e.g., "45 kr / kg" -> 45)
      let priceValue = item.priceValue;

      if (priceValue === undefined && typeof item.price === "string") {
        const priceMatch = item.price.match(/(\d+)/);
        priceValue = priceMatch ? parseFloat(priceMatch[0]) : 0;
        // Cache for future use
        item.priceValue = priceValue;
      }

      if (groupedItems[itemId]) {
        // Add to existing quantity instead of incrementing by 1
        groupedItems[itemId].quantity += item.quantity || 1;
        groupedItems[itemId].subtotal =
          priceValue * groupedItems[itemId].quantity;
      } else {
        // Add new item to grouped items with its original quantity
        groupedItems[itemId] = {
          ...item,
          quantity: item.quantity || 1,
          priceValue: priceValue,
          subtotal: priceValue * (item.quantity || 1),
        };
      }
    });

    // Convert to array and render items
    const items = Object.values(groupedItems);
    console.log("Grouped items:", items);

    if (items.length > 0) {
      items.forEach((item) => {
        const itemElement = createCheckoutItemElement(item);
        checkoutItems.appendChild(itemElement);
      });

      // Calculate and update totals
      const subtotal = calculateSubtotal(items);
      updateTotals(subtotal);
    } else {
      // If we somehow have an empty array after grouping
      checkoutItems.innerHTML = `
        <div class="checkout__empty">
          <p>Your cart is empty. Please add some products before checkout.</p>
          <a href="produce.html" class="checkout__continue-shopping">Browse Products</a>
        </div>
      `;
      updateTotals(0);
    }
  }

  /**
   * Create a DOM element for a checkout item
   *
   * @param {Object} item - Cart item with quantity and subtotal
   * @param {string} item.name - Product name
   * @param {string} item.image - URL to product image
   * @param {string} item.price - Formatted price string
   * @param {number} item.quantity - Product quantity
   * @param {number} item.subtotal - Total price for this item
   * @returns {HTMLElement} Checkout item DOM element
   */
  function createCheckoutItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.className = "checkout__item";

    // Make sure image has a value
    const imageSrc = item.image || "assets/produce/placeholder.png";

    itemElement.innerHTML = `
      <img src="${imageSrc}" alt="${item.name}" class="checkout__item-image">
      <div class="checkout__item-info">
        <h3 class="checkout__item-name">${item.name}</h3>
        <p class="checkout__item-price">${item.price}</p>
        <p class="checkout__item-quantity">Quantity: ${item.quantity}</p>
      </div>
      <div class="checkout__item-total">${item.subtotal} kr</div>
    `;

    return itemElement;
  }

  /**
   * Calculate the subtotal of all items
   *
   * @param {Array<Object>} items - Array of cart items with subtotals
   * @returns {number} Subtotal
   */
  function calculateSubtotal(items) {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Update the totals display in the checkout summary
   *
   * @param {number} subtotal - Subtotal amount
   * @returns {void}
   */
  function updateTotals(subtotal) {
    const total = subtotal + DELIVERY_FEE;

    if (subtotalElement) {
      subtotalElement.textContent = `${subtotal} kr`;
    }

    if (deliveryElement) {
      deliveryElement.textContent = `${DELIVERY_FEE} kr`;
    }

    if (totalElement) {
      totalElement.textContent = `${total} kr`;
    }
  }

  /**
   * Handle the form submission to complete an order
   * Validates form data and shows confirmation on success
   *
   * @param {Event} event - Form submission event
   * @returns {void}
   */
  function handleSubmitOrder(event) {
    event.preventDefault();

    if (isCartEmpty()) {
      showCheckoutError(
        "Your cart is empty. Please add items before checking out."
      );
      return;
    }

    // Get form data
    const formData = new FormData(checkoutForm);
    const customerData = Object.fromEntries(formData.entries());

    // Validate form (could add more detailed validation)
    if (!validateForm(customerData)) {
      return;
    }

    // Show processing state
    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Processing...";
    submitButton.disabled = true;

    // Simulate order processing (would be a real API call in production)
    setTimeout(() => {
      // Generate mock order details
      const orderNumber = generateOrderNumber();
      const deliveryDate = generateDeliveryDate();

      // Update confirmation modal with order details
      if (orderNumberElement) {
        orderNumberElement.textContent = orderNumber;
      }

      if (confirmationEmailElement) {
        confirmationEmailElement.textContent = customerData.email;
      }

      if (deliveryDateElement) {
        deliveryDateElement.textContent = deliveryDate;
      }

      // Show confirmation modal
      confirmationModal.classList.remove("modal--hidden");

      // Reset form and cart
      checkoutForm.reset();
      clearCart();

      // Reset button
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }, 1500);
  }

  /**
   * Validates checkout form data
   * Checks format and required fields:
   * - Email format
   * - Norwegian phone number format
   * - Norwegian postal code (4 digits)
   * - Required personal details
   * - Terms acceptance
   *
   * @param {Object} data - Form data to validate
   * @returns {boolean} True if valid, false otherwise
   */
  function validateForm(data) {
    // Reset all previous error messages
    document.querySelectorAll(".checkout__error-message").forEach((el) => {
      el.textContent = "";
    });

    let isValid = true;
    let firstErrorField = null;

    // Email validation using standard format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const emailError = document.getElementById("email-error");
      emailError.textContent = "Please enter a valid email address";
      if (!firstErrorField) firstErrorField = emailError;
      isValid = false;
    }

    // Phone validation for Norwegian format (+47 or 8 digits)
    const phoneRegex = /^(\+47)?[2-9]\d{7}$/;
    if (!phoneRegex.test(data.phone?.replace(/\s/g, ""))) {
      const phoneError = document.getElementById("phone-error");
      phoneError.textContent = "Please enter a valid Norwegian phone number";
      if (!firstErrorField) firstErrorField = phoneError;
      isValid = false;
    }

    // Norwegian postal code validation (4 digits)
    if (!/^\d{4}$/.test(data["postal-code"])) {
      const postalCodeError = document.getElementById("postal-code-error");
      postalCodeError.textContent = "Please enter a valid 4-digit postal code";
      if (!firstErrorField) firstErrorField = postalCodeError;
      isValid = false;
    }

    // Required personal information fields
    const requiredFields = [
      { id: "first-name", label: "First name" },
      { id: "last-name", label: "Last name" },
      { id: "address", label: "Address" },
      { id: "city", label: "City" },
    ];

    requiredFields.forEach((field) => {
      const fieldError = document.getElementById(`${field.id}-error`);
      if (!data[field.id]?.trim()) {
        fieldError.textContent = `${field.label} is required`;
        if (!firstErrorField) firstErrorField = fieldError;
        isValid = false;
      }
    });

    // Terms and conditions acceptance check
    if (!data.terms) {
      const termsError = document.getElementById("terms-error");
      termsError.textContent = "You must accept the Terms and Conditions";
      if (!firstErrorField) firstErrorField = termsError;
      isValid = false;
    }

    // Scroll to the first error field if any
    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return isValid;
  }

  /**
   * Generate a random order number
   * Creates a random number with a prefix for order references
   *
   * @returns {string} Order number in format "FR-XXXXX"
   */
  function generateOrderNumber() {
    const prefix = "FR-";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNum}`;
  }

  /**
   * Generate a delivery date (3 days from current date)
   * Calculates expected delivery date based on current date
   *
   * @returns {string} Formatted delivery date
   */
  function generateDeliveryDate() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    // Format date as "Month Day, Year"
    return deliveryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Clear the cart after successful order
   * Removes all items from cart storage
   *
   * @returns {void}
   */
  function clearCart() {
    // Clear cart using framCart if available
    if (window.framCart && window.framCart.clearCart) {
      window.framCart.clearCart();
    } else {
      // Fallback to directly clearing localStorage
      localStorage.setItem("cart", "[]");

      // Update cart count in navbar
      const cartButton = document.querySelector(".navbar__cart");
      if (cartButton) {
        cartButton.textContent = "0";
      }
    }
  }
});
