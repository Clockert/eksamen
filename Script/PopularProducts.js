/**
 * popularProducts.js - Handles the popular products component
 */
window.loadPopularProduce = function (containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID '${containerId}' not found`);
    return;
  }

  container.innerHTML = `
    <section class="popular-produce">
      <div class="popular-produce__header">
        <h2 class="popular-produce__title">Popular Produce</h2>
      </div>
      <div id="popular-products-grid" class="popular-produce__grid"></div>
    </section>
  `;

  // Load products
  fetch("data/products.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const popularProducts = data.products.filter((p) => p.popular);
      displayPopularProducts(popularProducts);
    })
    .catch((error) => {
      console.error("Error loading popular products:", error);
      document.getElementById("popular-products-grid").innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't load the popular products.</p>
        </div>
      `;
    });

  function displayPopularProducts(products) {
    const grid = document.getElementById("popular-products-grid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.id = product.id;
      card.dataset.name = product.name;
      card.dataset.price = product.price;
      card.dataset.image = product.image;

      card.innerHTML = `
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

      grid.appendChild(card);
    });
  }
};
