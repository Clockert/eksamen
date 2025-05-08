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

      // Use the productRenderer to display products
      const grid = document.getElementById("popular-products-grid");
      if (grid && window.productRenderer) {
        window.productRenderer.displayProducts(popularProducts, grid);
      } else {
        console.error(
          "productRenderer not available - make sure productRenderer.js is loaded"
        );
        grid.innerHTML = `
          <div class="error-message">
            <p>Sorry, we couldn't load the popular products.</p>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error("Error loading popular products:", error);
      document.getElementById("popular-products-grid").innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't load the popular products.</p>
        </div>
      `;
    });
};
