// produce.js - Handles product listings and product detail functionality
document.addEventListener("DOMContentLoaded", () => {
  // Common elements
  const productsGrid = document.getElementById("products-container");
  const productDetailContent = document.querySelector(
    ".product-detail__content"
  );
  // New: Add loading indicator references
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

  // Check if we're on the product detail page
  const isProductDetailPage =
    window.location.pathname.includes("product-detail");

  // Get product ID if on detail page
  let productId = null;
  let currentProduct = null;

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

  // Fetch products from JSON file
  fetch("data/products.json")
    .then((response) => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // For product listing page
      if (productsGrid) {
        // Hide loading indicator when products are ready to display
        if (productsLoadingIndicator) {
          productsLoadingIndicator.style.display = "none";
        }

        displayProducts(data.products, productsGrid);
      }

      // For product detail page
      if (isProductDetailPage && productId) {
        // Hide the product loading indicator on detail page
        if (productLoadingIndicator) {
          productLoadingIndicator.style.display = "none";
        }

        currentProduct = data.products.find((p) => p.id === productId);

        if (!currentProduct) {
          // Show error if product not found
          if (productErrorElement) {
            productErrorElement.style.display = "block";
          }

          // Hide product content
          if (productDetailContent) {
            productDetailContent.style.display = "none";
          }

          // Update breadcrumb
          if (breadcrumbProductName) {
            breadcrumbProductName.textContent = "Product not found";
          }

          return;
        }

        displayProductDetails(currentProduct);

        // Setup add to cart button
        if (addToCartDetailButton) {
          // Set the data attributes on the button for easier access
          addToCartDetailButton.dataset.id = currentProduct.id;
          addToCartDetailButton.dataset.name = currentProduct.name;
          addToCartDetailButton.dataset.price = currentProduct.price;
          addToCartDetailButton.dataset.image = currentProduct.image;

          // Add event listener
          addToCartDetailButton.addEventListener("click", () => {
            const quantity = parseInt(quantityInput.value || 1);

            if (window.framCart && window.framCart.addToCart) {
              window.framCart.addToCart(currentProduct, quantity, true);
              window.framCart.showAddedToCartFeedback(
                addToCartDetailButton,
                quantity
              );
            } else {
              // Fallback if framCart not available
              console.error("framCart not available");
            }
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);

      // Show error message and hide loading indicators
      if (productsLoadingIndicator) {
        productsLoadingIndicator.style.display = "none";
      }

      if (productLoadingIndicator) {
        productLoadingIndicator.style.display = "none";
      }

      if (isProductDetailPage && productErrorElement) {
        productErrorElement.style.display = "block";

        // Hide product content
        if (productDetailContent) {
          productDetailContent.style.display = "none";
        }
      }

      showErrorMessage();
    });

  // Display product cards
  function displayProducts(products, container) {
    container.innerHTML = "";

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

      container.appendChild(productCard);
    });
  }

  // Display product details on detail page
  function displayProductDetails(product) {
    if (!productNameElement) return;

    document.title = `FRAM - ${product.name}`;

    if (productNameElement) productNameElement.textContent = product.name;
    if (productImageElement) {
      productImageElement.src = product.image;
      productImageElement.alt = product.name;
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

  // Create and display nutrition section
  async function createNutritionSection(product) {
    // Check if we're on the product detail page
    if (!isProductDetailPage || !productDetailContent) return;

    // Check if a nutrition section already exists
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

      // Insert nutrition section in the correct position
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

    // Fetch nutrition data using the cache system
    try {
      let nutritionData;

      // Use the nutrition cache if available
      if (window.nutritionCache && window.nutritionCache.getNutrition) {
        nutritionData = await window.nutritionCache.getNutrition(product.name);
      } else {
        // Fallback to direct API call if cache not available
        nutritionData = await fetchNutritionData(product.name);
      }

      // Display nutrition data
      if (
        nutritionData &&
        nutritionData.foods &&
        nutritionData.foods.length > 0
      ) {
        displayNutritionInfo(nutritionData.foods[0]);
      } else {
        const nutritionDataContainer =
          document.querySelector(".nutrition-data");
        if (nutritionDataContainer) {
          nutritionDataContainer.innerHTML =
            '<p class="product-detail__nutrition-error">No nutrition information found for this product.</p>';
        }
      }
    } catch (error) {
      console.error("Failed to process nutrition data:", error);
      const nutritionDataContainer = document.querySelector(".nutrition-data");
      if (nutritionDataContainer) {
        nutritionDataContainer.innerHTML =
          '<p class="product-detail__nutrition-error">Failed to load nutrition information. Please try again later.</p>';
      }
    }
  }

  // Fetch nutrition data from our server API (used as fallback if cache isn't available)
  async function fetchNutritionData(productName) {
    console.log("Directly fetching nutrition data for:", productName);

    try {
      const response = await fetch(
        `http://localhost:3000/api/nutrition/${encodeURIComponent(productName)}`
      );

      if (!response.ok) {
        throw new Error(
          `Nutrition API responded with status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching nutrition data:", error.message);
      return null;
    }
  }

  // Display nutrition information in the UI
  function displayNutritionInfo(foodItem) {
    const nutritionData = document.querySelector(".nutrition-data");
    if (!nutritionData) return;

    // Clear loading message
    nutritionData.innerHTML = "";

    // Create a table for the nutrition information
    const table = document.createElement("table");
    table.className = "product-detail__nutrition-table";

    // Add table header
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Nutrient</th><th>Amount</th>";
    table.appendChild(headerRow);

    // Define the nutrients we want to display (in order of importance)
    const keyNutrients = [
      { name: "Energy", ids: [1008, 2048], unit: "kcal" },
      { name: "Protein", ids: [1003], unit: "g" },
      { name: "Carbohydrates", ids: [1005, 2000], unit: "g" },
      { name: "Fat", ids: [1004], unit: "g" },
      { name: "Fiber", ids: [1079, 2033], unit: "g" },
      { name: "Sugar", ids: [2000, 1082], unit: "g" },
      { name: "Sodium", ids: [1093, 1090], unit: "mg" },
    ];

    // Get all nutrients from the food item
    const nutrients = foodItem.foodNutrients || [];

    // For each key nutrient, try to find it in the API response
    let nutrientsFound = 0;

    keyNutrients.forEach((keyNutrient) => {
      // Find the nutrient in the API response
      const foundNutrient = nutrients.find((apiNutrient) => {
        // Different API responses have different structures
        const nutrientId = apiNutrient.nutrientId || apiNutrient.nutrient?.id;
        return keyNutrient.ids.includes(nutrientId);
      });

      // If we found the nutrient, add it to the table
      if (foundNutrient) {
        nutrientsFound++;

        // Extract the value and unit
        const value = foundNutrient.value || foundNutrient.amount || 0;
        const unit =
          foundNutrient.unitName ||
          foundNutrient.nutrient?.unitName ||
          keyNutrient.unit;

        // Create a row for this nutrient
        const row = document.createElement("tr");
        row.innerHTML = `<td>${keyNutrient.name}</td><td>${value} ${unit}</td>`;
        table.appendChild(row);
      }
    });

    // Display the table if we found any nutrients
    if (nutrientsFound > 0) {
      nutritionData.appendChild(table);

      // Add source information
      const source = document.createElement("p");
      source.className = "product-detail__nutrition-source";
      source.textContent = "Source: USDA Food Data Central";
      nutritionData.appendChild(source);
    } else {
      // No nutrients found
      nutritionData.innerHTML =
        '<p class="product-detail__nutrition-error">Detailed nutrition information not available for this product.</p>';
    }
  }

  // Set up quantity input controls
  function setupQuantityControls() {
    if (!quantityInput || !decreaseBtn || !increaseBtn) return;

    // Ensure quantity is never less than 1
    quantityInput.addEventListener("change", () => {
      if (quantityInput.value < 1) {
        quantityInput.value = 1;
      }
    });

    // Decrease quantity button
    decreaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    // Increase quantity button
    increaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
  }

  // Show error messages when products can't be loaded
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

// Set a flag to indicate that we have the produce event handler active
// This will help cart.js know not to add duplicate handlers
window.produceHandlerActive = true;

// Event delegation for dynamically created product cards
document.addEventListener("click", (event) => {
  // This event handler is kept for backward compatibility
  // Most functionality has been moved to the framCart object
  // But we keep this as a fallback for pages that might not have loaded the new cart.js

  const addButton = event.target.closest(
    ".product-card__add-button, .product-detail__add-to-cart"
  );

  if (addButton && !window.framCart) {
    event.preventDefault();

    // Find the closest product card
    const productCard = addButton.closest(".product-card");

    if (productCard) {
      // Get product data from card
      const product = {
        id: productCard.dataset.id || addButton.dataset.id,
        name:
          productCard.dataset.name ||
          addButton.dataset.name ||
          productCard.querySelector(".product-card__name")?.textContent,
        price:
          productCard.dataset.price ||
          addButton.dataset.price ||
          productCard.querySelector(".product-card__price")?.textContent,
        image:
          productCard.dataset.image ||
          addButton.dataset.image ||
          productCard.querySelector("img")?.src,
      };

      // Legacy fallback for adding to cart
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update cart count in navbar
      const cartButton = document.querySelector(".navbar__cart");
      if (cartButton) {
        cartButton.textContent = cart.length;
      }

      // Show feedback
      const originalText = addButton.innerHTML;
      addButton.innerHTML =
        'Added! <span class="product-card__icon"><i class="fas fa-check"></i></span>';
      addButton.style.backgroundColor = "#28bd6d";

      setTimeout(() => {
        addButton.innerHTML = originalText;
        addButton.style.backgroundColor = "";
      }, 1500);
    }
  }
});
