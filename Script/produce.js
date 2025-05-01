// produce.js - Handles product listings and product detail functionality
document.addEventListener("DOMContentLoaded", () => {
  // Common elements
  const productsGrid = document.getElementById("products-container");
  const popularProductsGrid = document.getElementById(
    "popular-products-container"
  );

  // Product detail page elements
  const productNameElement = document.getElementById("product-name");
  const productImageElement = document.getElementById("product-image");
  const productPriceElement = document.getElementById("product-price");
  const productQuantityElement = document.getElementById("product-quantity");
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

  // Initialize cart
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Note: We no longer need to update cart count here as it's handled by Components.js

  // Fetch nutrition data from our server API
  async function fetchNutritionData(productName) {
    console.log("Fetching nutrition data for:", productName);

    try {
      // Use the full URL with the correct port (3000)
      const response = await fetch(
        `http://localhost:3000/api/nutrition/${encodeURIComponent(productName)}`
      );

      // Check if the request was successful
      if (!response.ok) {
        console.error("Nutrition API error:", response.status);
        throw new Error(
          `Nutrition API responded with status: ${response.status}`
        );
      }

      // Parse the JSON response
      const data = await response.json();

      // Log the received data to verify content
      console.log("Nutrition data received:", data);
      console.log("Total foods found:", data.foods?.length || 0);

      // Return the data for further processing
      return data;
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
    table.className = "nutrition-table";

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
      source.className = "nutrition-source";
      source.textContent = "Source: USDA Food Data Central";
      nutritionData.appendChild(source);
    } else {
      // No nutrients found
      nutritionData.innerHTML =
        '<p class="nutrition-error">Detailed nutrition information not available for this product.</p>';
    }
  }

  // Fetch products from JSON file
  fetch("data/products.json")
    .then((response) => response.json())
    .then((data) => {
      // For product listing page
      if (productsGrid) {
        displayProducts(data.products, productsGrid);
      }

      // For popular products section
      if (popularProductsGrid) {
        const popularProducts = data.products.filter(
          (product) => product.popular
        );
        displayProducts(popularProducts, popularProductsGrid);
      }

      // For product detail page
      if (isProductDetailPage && productId) {
        const product = data.products.find((p) => p.id === productId);

        if (!product) {
          window.location.href = "produce.html";
          return;
        }

        displayProductDetails(product);

        // Add to cart button handler
        if (addToCartDetailButton) {
          addToCartDetailButton.addEventListener("click", () => {
            const quantity = parseInt(quantityInput.value || 1);
            addToCart(product, quantity);
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error loading products:", error);
      showErrorMessage();
    });

  // Display product cards with BEM class names
  function displayProducts(products, container) {
    container.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";

      productCard.innerHTML = `
      <div class="product-card__image-container">
        <a href="product-detail.html?id=${product.id}" class="product-card__link">
          <img src="${product.image}" alt="${product.name}" class="product-card__image">
        </a>
        <a href="product-detail.html?id=${product.id}" class="product-card__add-button" aria-label="View details of ${product.name}">
          Add to basket
          <span class="product-card__icon"><i class="fas fa-arrow-up"></i></span>
        </a>
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
    productNameElement.textContent = product.name;
    productImageElement.src = product.image;
    productImageElement.alt = product.name;
    productPriceElement.textContent = product.price;

    // Update package size
    const packageSizeValue = document.getElementById("package-size-value");
    if (packageSizeValue) {
      packageSizeValue.textContent = product.quantity;
    }

    if (breadcrumbProductName) {
      breadcrumbProductName.textContent = product.name;
    }

    // Create a placeholder for nutrition information with loading state
    // Check if a nutrition section already exists
    let nutritionSection = document.querySelector(".nutrition-section");
    if (!nutritionSection) {
      nutritionSection = document.createElement("div");
      nutritionSection.className = "nutrition-section";
      nutritionSection.innerHTML = `
      <h2>Nutrition Information</h2>
      <div class="nutrition-data">
        <p class="loading-text">Loading nutrition data...</p>
      </div>
    `;

      // Insert nutrition section after the product image container
      const productImageContainer = document.querySelector(
        ".product-image-detail"
      );
      if (productImageContainer) {
        productImageContainer.insertAdjacentElement(
          "afterend",
          nutritionSection
        );
      }
    }

    // Fetch nutrition data for this product
    console.log("Starting nutrition data fetch process for:", product.name);
    fetchNutritionData(product.name)
      .then((data) => {
        console.log("Processing nutrition data for display");
        if (data && data.foods && data.foods.length > 0) {
          console.log("First food item:", data.foods[0].description);
          console.log(
            "Number of nutrients:",
            data.foods[0].foodNutrients?.length || 0
          );

          // Display nutrition data in the UI
          displayNutritionInfo(data.foods[0]);
        } else {
          console.log("No nutrition data found for this product");
          const nutritionData = document.querySelector(".nutrition-data");
          if (nutritionData) {
            nutritionData.innerHTML =
              '<p class="nutrition-error">No nutrition information found for this product.</p>';
          }
        }
      })
      .catch((error) => {
        console.error("Failed to process nutrition data:", error);
        const nutritionData = document.querySelector(".nutrition-data");
        if (nutritionData) {
          nutritionData.innerHTML =
            '<p class="nutrition-error">Failed to load nutrition information. Please try again later.</p>';
        }
      });
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

  // Add product to cart
  function addToCart(product, quantity) {
    // Add product to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      cart.push(product);
    }

    // Use the global updateCart function from Components.js
    if (window.updateCart) {
      window.updateCart(cart);
    } else {
      // Fallback if updateCart function isn't available
      localStorage.setItem("cart", JSON.stringify(cart));
      console.warn("window.updateCart function not found");
    }

    // Show feedback
    showAddedToCartFeedback(quantity);
  }

  // Show feedback when products are added to cart
  function showAddedToCartFeedback(quantity) {
    const originalText = addToCartDetailButton.innerHTML;
    addToCartDetailButton.innerHTML = `Added ${quantity}! <span class="product-card__icon"><i class="fas fa-check"></i></span>`;
    addToCartDetailButton.disabled = true;
    addToCartDetailButton.style.backgroundColor = "#28bd6d";

    setTimeout(() => {
      addToCartDetailButton.innerHTML = originalText;
      addToCartDetailButton.disabled = false;
      addToCartDetailButton.style.backgroundColor = "";
    }, 1500);
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

    if (popularProductsGrid) {
      popularProductsGrid.innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't load the popular products. Please try again later.</p>
        </div>
      `;
    }

    if (isProductDetailPage && productNameElement) {
      productNameElement.textContent = "Product not found";
      if (productImageElement) productImageElement.src = "";
      if (productPriceElement) productPriceElement.textContent = "";
      if (productQuantityElement) productQuantityElement.textContent = "";
    }
  }
});
