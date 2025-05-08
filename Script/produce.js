/**
 * produce.js - Handles product listings and product detail functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Common elements
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
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // For product listing page
      if (productsGrid) {
        if (productsLoadingIndicator) {
          productsLoadingIndicator.style.display = "none";
        }

        // Use the new productRenderer to display products
        if (window.productRenderer) {
          window.productRenderer.displayProducts(data.products, productsGrid);
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

            // Use framCart if available
            if (window.framCart) {
              window.framCart.addToCart(currentProduct, quantity, true);
            } else {
              // Fallback if framCart not available
              const cart = JSON.parse(localStorage.getItem("cart")) || [];
              for (let i = 0; i < quantity; i++) {
                cart.push(currentProduct);
              }
              localStorage.setItem("cart", JSON.stringify(cart));

              // Update cart count
              const cartButton = document.querySelector(".navbar__cart");
              if (cartButton) {
                cartButton.textContent = cart.length;
              }
            }

            // Show feedback
            if (window.productRenderer) {
              window.productRenderer.showAddedFeedback(
                addToCartDetailButton,
                quantity
              );
            } else {
              showAddedToCartFeedback(addToCartDetailButton, quantity);
            }
          });
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
    fetchNutritionData(product.name);
  }

  // Fetch nutrition data from cache or API
  async function fetchNutritionData(productName) {
    try {
      let nutritionData;

      // Use cache if available
      if (
        window.nutritionCache &&
        typeof window.nutritionCache.getNutrition === "function"
      ) {
        nutritionData = await window.nutritionCache.getNutrition(productName);
      } else {
        // Direct API call fallback
        const response = await fetch(
          `http://localhost:3000/api/nutrition/${encodeURIComponent(
            productName
          )}`
        );
        if (!response.ok) {
          throw new Error(`Nutrition API error: ${response.status}`);
        }
        nutritionData = await response.json();
      }

      // Display nutrition data
      if (nutritionData?.foods?.length > 0) {
        displayNutritionInfo(nutritionData.foods[0]);
      } else {
        const container = document.querySelector(".nutrition-data");
        if (container) {
          container.innerHTML =
            '<p class="product-detail__nutrition-error">No nutrition information found.</p>';
        }
      }
    } catch (error) {
      console.error("Nutrition data error:", error);
      const container = document.querySelector(".nutrition-data");
      if (container) {
        container.innerHTML =
          '<p class="product-detail__nutrition-error">Failed to load nutrition information.</p>';
      }
    }
  }

  // Display nutrition information
  function displayNutritionInfo(foodItem) {
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
    const nutrients = foodItem.foodNutrients || [];
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
      const source = document.createElement("p");
      source.className = "product-detail__nutrition-source";
      source.textContent = "Source: USDA Food Data Central";
      nutritionData.appendChild(source);
    } else {
      nutritionData.innerHTML =
        '<p class="product-detail__nutrition-error">Nutrition information not available.</p>';
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

  // Show added-to-cart feedback
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
});

// Set a flag to indicate that produce.js is handling product events
window.produceHandlerActive = true;
