/**
 * produce.js - Product listing and detail page functionality
 *
 * This refactored module handles all product-related functionality including:
 * - Loading and displaying products on the listing page
 * - Rendering detailed product information on the product detail page
 * - Fetching and displaying nutrition information
 *
 * Updated to work with the template-based system.
 *
 * @author Clockert
 */

// Export the displayNutritionInfo function globally so nutrition-cache.js can use it
window.displayNutritionInfo = function (foodItem, usingFallback = false) {
  const nutritionData = document.querySelector(".nutrition-data");
  if (!nutritionData) return;

  nutritionData.innerHTML = "";

  // Create table
  const table = document.createElement("table");
  table.className = "product-detail__nutrition-table";

  // Add header
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Nutrient</th><th>Amount</th>";
  table.appendChild(headerRow);

  // Define key nutrients
  const keyNutrients = [
    { name: "Energy", ids: [1008, 2048], unit: "kcal" },
    { name: "Protein", ids: [1003], unit: "g" },
    { name: "Carbohydrates", ids: [1005, 2000], unit: "g" },
    { name: "Fat", ids: [1004], unit: "g" },
    { name: "Fiber", ids: [1079, 2033], unit: "g" },
    { name: "Sugar", ids: [2000, 1082], unit: "g" },
    { name: "Sodium", ids: [1093, 1090], unit: "mg" },
  ];

  // Get nutrients
  const nutrients = foodItem?.foodNutrients || [];
  let nutrientsFound = 0;

  keyNutrients.forEach((keyNutrient) => {
    const foundNutrient = nutrients.find((apiNutrient) => {
      const nutrientId = apiNutrient.nutrientId || apiNutrient.nutrient?.id;
      return keyNutrient.ids.includes(nutrientId);
    });

    if (foundNutrient) {
      nutrientsFound++;
      const value = foundNutrient.value || foundNutrient.amount || 0;
      const unit =
        foundNutrient.unitName ||
        foundNutrient.nutrient?.unitName ||
        keyNutrient.unit;

      const row = document.createElement("tr");
      row.innerHTML = `<td>${keyNutrient.name}</td><td>${value} ${unit}</td>`;
      table.appendChild(row);
    }
  });

  if (nutrientsFound > 0) {
    nutritionData.appendChild(table);

    // Add fallback notice if using fallback data
    if (usingFallback) {
      const fallbackNotice = document.createElement("p");
      fallbackNotice.className = "product-detail__nutrition-notice";
      fallbackNotice.textContent = "Using estimated nutrition values.";
      nutritionData.appendChild(fallbackNotice);
    } else {
      const source = document.createElement("p");
      source.className = "product-detail__nutrition-source";
      source.textContent = "Source: USDA Food Data Central";
      nutritionData.appendChild(source);
    }
  } else {
    nutritionData.innerHTML =
      '<p class="product-detail__nutrition-error">Nutrition information not available.</p>';
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Common elements that might exist on either page
  const productsGrid = document.getElementById("products-container");
  const productDetailContent = document.querySelector(
    ".product-detail__content"
  );
  const productsLoadingIndicator = document.getElementById("products-loading");
  const productLoadingIndicator = document.getElementById("product-loading");
  const productErrorElement = document.getElementById("product-error");

  // Product detail page elements
  const productNameElement = document.getElementById("product-name");
  const productImageElement = document.getElementById("product-image");
  const productPriceElement = document.getElementById("product-price");
  const packageSizeElement = document.getElementById("package-size-value");
  const breadcrumbProductName = document.getElementById(
    "breadcrumb-product-name"
  );
  const addToCartDetailButton = document.getElementById("add-to-cart-detail");
  const quantityInput = document.getElementById("quantity");
  const decreaseBtn = document.getElementById("decrease-quantity");
  const increaseBtn = document.getElementById("increase-quantity");

  // Check if we're on the product detail page by examining the URL
  const isProductDetailPage =
    window.location.pathname.includes("product-detail");

  // Variables for tracking product data
  let productId = null;
  let currentProduct = null;

  /**
   * Initialize product detail page if applicable
   * Gets product ID from URL parameters and sets up quantity controls
   *
   * @returns {void}
   */
  if (isProductDetailPage) {
    const urlParams = new URLSearchParams(window.location.search);
    productId = parseInt(urlParams.get("id"));

    // Redirect if no product ID
    if (!productId) {
      window.location.href = "produce.html";
      return;
    }

    // Set up quantity controls
    setupQuantityControls();
  }

  /**
   * Fetch products from JSON file
   * Loads product data and initializes the appropriate page functionality
   *
   * @returns {Promise<void>}
   */
  fetch("data/products.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      return response.json();
    })
    .then(async (data) => {
      // For product listing page
      if (productsGrid) {
        if (productsLoadingIndicator) {
          productsLoadingIndicator.style.display = "none";
        }

        // Use the productRenderer to display products
        if (window.productRenderer) {
          // Note the await here since displayProducts is now async
          await window.productRenderer.displayProducts(
            data.products,
            productsGrid
          );
        } else {
          console.error(
            "productRenderer not available - make sure productRenderer.js is loaded"
          );
          showErrorMessage();
        }
      }

      // For product detail page
      if (isProductDetailPage && productId) {
        if (productLoadingIndicator) {
          productLoadingIndicator.style.display = "none";
        }

        // Find the specific product by ID
        currentProduct = data.products.find((p) => p.id === productId);

        if (!currentProduct) {
          if (productErrorElement) {
            productErrorElement.style.display = "block";
          }

          if (productDetailContent) {
            productDetailContent.style.display = "none";
          }

          if (breadcrumbProductName) {
            breadcrumbProductName.textContent = "Product not found";
          }

          return;
        }

        // Display product details
        displayProductDetails(currentProduct);

        // Setup add to cart button
        if (addToCartDetailButton) {
          // Set the data attributes on the button for easier access
          addToCartDetailButton.dataset.id = currentProduct.id;
          addToCartDetailButton.dataset.name = currentProduct.name;
          addToCartDetailButton.dataset.price = currentProduct.price;
          addToCartDetailButton.dataset.image = currentProduct.image;
        }
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);

      if (productsLoadingIndicator) {
        productsLoadingIndicator.style.display = "none";
      }

      if (productLoadingIndicator) {
        productLoadingIndicator.style.display = "none";
      }

      if (isProductDetailPage && productErrorElement) {
        productErrorElement.style.display = "block";

        if (productDetailContent) {
          productDetailContent.style.display = "none";
        }
      }

      showErrorMessage();
    });

  /**
   * Display product details on the detail page
   * Populates all product information fields with data
   *
   * @param {Object} product - The product object to display
   * @returns {void}
   */
  function displayProductDetails(product) {
    if (!productNameElement) return;

    document.title = `FRAM - ${product.name}`;

    if (productNameElement) productNameElement.textContent = product.name;
    if (productImageElement) {
      productImageElement.src = product.image;

      // Create a consistent alt text format for all products
      // Format: "Product name from Farm, cultivated with Cultivation method"
      const altText = `${product.name} from ${product.farm}, cultivated with ${product.cultivation}`;

      productImageElement.alt = altText;
    }
    if (productPriceElement) productPriceElement.textContent = product.price;
    if (packageSizeElement) packageSizeElement.textContent = product.quantity;
    if (breadcrumbProductName) breadcrumbProductName.textContent = product.name;

    // Populate description, farm, and cultivation
    const productDescriptionElement = document.getElementById(
      "product-description"
    );
    const productFarmElement = document.getElementById("product-farm");
    const productCultivationElement = document.getElementById(
      "product-cultivation"
    );

    if (productDescriptionElement)
      productDescriptionElement.textContent = product.description;
    if (productFarmElement) productFarmElement.textContent = product.farm;
    if (productCultivationElement)
      productCultivationElement.textContent = product.cultivation;

    // Create nutrition section if it doesn't exist
    createNutritionSection(product);
  }

  /**
   * Create and display nutrition section
   * Creates the nutrition information section if it doesn't exist
   *
   * @param {Object} product - Product to fetch nutrition data for
   * @param {string} product.name - Product name to look up nutrition data
   * @returns {void}
   */
  function createNutritionSection(product) {
    if (!isProductDetailPage || !productDetailContent) return;

    let nutritionSection = document.querySelector(".product-detail__nutrition");
    if (!nutritionSection) {
      nutritionSection = document.createElement("div");
      nutritionSection.className = "product-detail__nutrition";
      nutritionSection.innerHTML = `
        <h2>Nutrition Information</h2>
        <div class="nutrition-data">
          <p class="product-detail__loading-text">Loading nutrition data...</p>
        </div>
      `;

      const productImageContainer = document.querySelector(
        ".product-detail__image-container"
      );
      if (productImageContainer) {
        productImageContainer.insertAdjacentElement(
          "afterend",
          nutritionSection
        );
      }
    }

    // Fetch nutrition data
    if (typeof fetchNutritionData === "function") {
      fetchNutritionData(product.name);
    } else {
      console.error("fetchNutritionData function not found");
    }
  }

  /**
   * Set up quantity input controls
   * Handles incrementing, decrementing, and validating quantity input
   *
   * @returns {void}
   */
  function setupQuantityControls() {
    if (!quantityInput || !decreaseBtn || !increaseBtn) return;

    // Remove any existing event listeners
    const newDecreaseBtn = decreaseBtn.cloneNode(true);
    const newIncreaseBtn = increaseBtn.cloneNode(true);
    decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
    increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);

    /**
     * Ensures quantity is a valid number
     * Sets to 1 if invalid or less than 1
     *
     * @returns {void}
     */
    const validateQuantity = () => {
      let value = parseInt(quantityInput.value);
      if (isNaN(value) || value < 1) {
        quantityInput.value = 1;
      } else {
        quantityInput.value = value;
      }
    };

    // Ensure proper number entry on change
    quantityInput.addEventListener("change", validateQuantity);
    quantityInput.addEventListener("blur", validateQuantity);

    // Prevent non-numeric entries
    quantityInput.addEventListener("keypress", (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Decrease quantity button
    newDecreaseBtn.addEventListener("click", () => {
      let currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    // Increase quantity button
    newIncreaseBtn.addEventListener("click", () => {
      let currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }

  /**
   * Show error messages when products can't be loaded
   * Displays user-friendly error messages in appropriate containers
   *
   * @returns {void}
   */
  function showErrorMessage() {
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't load the products. Please try again later.</p>
        </div>
      `;
    }

    if (isProductDetailPage && productNameElement) {
      productNameElement.textContent = "Product not found";
      if (productImageElement) productImageElement.src = "";
      if (productPriceElement) productPriceElement.textContent = "";
      if (packageSizeElement) packageSizeElement.textContent = "";
    }
  }
});

// Set a flag to indicate that produce.js is handling product events
window.produceHandlerActive = true;
