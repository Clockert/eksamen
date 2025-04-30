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
  updateCartCount(cart.length);

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

  // Display product cards with links to detail page
  function displayProducts(products, container) {
    container.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";

      productCard.innerHTML = `
        <div class="product-image-container">
          <a href="product-detail.html?id=${product.id}" class="product-link">
            <img src="${product.image}" alt="${product.name}" class="product-image">
          </a>
          <a href="product-detail.html?id=${product.id}" class="add-to-cart" aria-label="View details of ${product.name}">
            Add to basket
            <span class="arrow-up-icon"><i class="fas fa-arrow-up"></i></span>
          </a>
        </div>
        <div class="product-info">
          <div class="product-header">
            <h3 class="product-name">
              <a href="product-detail.html?id=${product.id}" class="product-link">${product.name}</a>
            </h3>
            <div class="product-price">${product.price}</div>
          </div>
          <p class="product-quantity">${product.quantity}</p>
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
    productQuantityElement.textContent = product.quantity;

    if (breadcrumbProductName) {
      breadcrumbProductName.textContent = product.name;
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

  // Add product to cart
  function addToCart(product, quantity) {
    // Add product to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      cart.push(product);
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart count
    updateCartCount(cart.length);

    // Show feedback
    showAddedToCartFeedback(quantity);
  }

  // Show feedback when products are added to cart
  function showAddedToCartFeedback(quantity) {
    const originalText = addToCartDetailButton.innerHTML;
    addToCartDetailButton.innerHTML = `Added ${quantity}! <span class="arrow-up-icon"><i class="fas fa-check"></i></span>`;
    addToCartDetailButton.disabled = true;
    addToCartDetailButton.style.backgroundColor = "#28bd6d";

    setTimeout(() => {
      addToCartDetailButton.innerHTML = originalText;
      addToCartDetailButton.disabled = false;
      addToCartDetailButton.style.backgroundColor = "";
    }, 1500);
  }

  // Update cart counter in navbar
  function updateCartCount(count) {
    const cartButton = document.querySelector(".green-btn");
    if (cartButton) {
      cartButton.textContent = count;
    }
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
