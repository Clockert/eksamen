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

        displayProducts(data.products, productsGrid);
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

        // Setup add to cart button - SIMPLIFIED!
        if (addToCartDetailButton) {
          // Set the data attributes on the button for easier access
          addToCartDetailButton.dataset.id = currentProduct.id;
          addToCartDetailButton.dataset.name = currentProduct.name;
          addToCartDetailButton.dataset.price = currentProduct.price;
          addToCartDetailButton.dataset.image = currentProduct.image;

          // Add event listener - SIMPLIFIED!
          addToCartDetailButton.addEventListener("click", () => {
            const quantity = parseInt(quantityInput.value || 1);

            // Use framCart API - let integration.js handle the UI feedback
            if (window.framCart) {
              window.framCart.addToCart(currentProduct, quantity, true);
            } else {
              console.error("framCart not available");
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

  // The rest of your functions remain unchanged
  // createNutritionSection, fetchNutritionData, displayNutritionInfo, etc.

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

// Set a flag to indicate that produce.js is handling product events
// This prevents duplicate handlers in integration.js
window.produceHandlerActive = true;
