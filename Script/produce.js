// Load products when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const productsGrid = document.getElementById("products-container");
  const popularProductsGrid = document.getElementById(
    "popular-products-container"
  );

  // Fetch products from JSON file
  fetch("data/products.json")
    .then((response) => response.json())
    .then((data) => {
      // If we're on the products page
      if (productsGrid) {
        displayProducts(data.products, productsGrid);
      }

      // If we're on a page with the popular products section
      if (popularProductsGrid) {
        // Filter only popular products
        const popularProducts = data.products.filter(
          (product) => product.popular
        );
        displayProducts(popularProducts, popularProductsGrid);
      }

      setupCartFunctionality();
    })
    .catch((error) => {
      console.error("Error loading products:", error);

      // Display error message in appropriate container
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
    });
});

// Create and display product cards
function displayProducts(products, container) {
  container.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <button class="add-to-cart" data-id="${product.id}">
          Add to basket
          <span class="arrow-up-icon"><i class="fas fa-arrow-up"></i></span>
        </button>
      </div>
      <div class="product-info">
        <div class="product-header">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">${product.price}</div>
        </div>
        <p class="product-quantity">${product.quantity}</p>
      </div>
    `;

    container.appendChild(productCard);
  });
}

// Handle cart interactions
function setupCartFunctionality() {
  // Initialize cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartCount(cart.length);

  // Listen for add to cart button clicks
  document.addEventListener("click", (event) => {
    if (event.target.closest(".add-to-cart")) {
      const button = event.target.closest(".add-to-cart");
      const productId = parseInt(button.dataset.id);

      fetch("data/products.json")
        .then((response) => response.json())
        .then((data) => {
          const product = data.products.find((p) => p.id === productId);

          if (product) {
            // Add product to cart
            cart.push(product);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount(cart.length);
            showAddedToCartFeedback(button);
          }
        });
    }
  });
}

// Update the cart counter in navbar
function updateCartCount(count) {
  const cartButton = document.querySelector(".green-btn");
  if (cartButton) {
    cartButton.textContent = count;
  }
}

// Show visual feedback when a product is added
function showAddedToCartFeedback(button) {
  const originalText = button.innerHTML;
  button.innerHTML =
    'Added! <span class="arrow-up-icon"><i class="fas fa-check"></i></span>';
  button.disabled = true;
  button.style.backgroundColor = "#28bd6d";

  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
    button.style.backgroundColor = "";
  }, 1500);
}
