/**
 * PopularProducts.js - Popular Products Component Manager
 *
 * This module creates and manages the "Popular Products" component
 * that appears on the homepage and product detail pages.
 *
 * It handles:
 * - Dynamically creating the component container and structure
 * - Loading products data from the JSON source
 * - Filtering for products marked as "popular"
 * - Rendering products using the productRenderer module
 * - Error handling for failed data fetching
 *
 * The component displays as a grid on desktop and transforms into
 * a horizontally scrollable carousel on mobile devices.
 *
 * @author Clockert
 */

/**
 * Loads the popular products component into a specified container
 *
 * This is the main exported function that creates the popular products
 * section, loads product data, and renders the filtered product list.
 *
 * @param {string} containerId - ID of the container element to insert the component
 */
window.loadPopularProduce = function (containerId) {
  // Get the target container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID '${containerId}' not found`);
    return;
  }

  // Create component structure with heading and grid container
  container.innerHTML = `
    <section class="popular-produce">
      <div class="popular-produce__header">
        <h2 class="popular-produce__title">Popular Produce</h2>
      </div>
      <div id="popular-products-grid" class="popular-produce__grid"></div>
    </section>
  `;

  // Load products data
  loadProductsData();

  /**
   * Loads product data from JSON file
   * Fetches data, filters for popular products, and passes to renderer
   */
  function loadProductsData() {
    fetch("data/products.json")
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        // Filter products to only show those marked as popular
        const popularProducts = data.products.filter((p) => p.popular);

        // Use the productRenderer to display products
        const grid = document.getElementById("popular-products-grid");
        if (grid && window.productRenderer) {
          window.productRenderer.displayProducts(popularProducts, grid);
        } else {
          console.error(
            "productRenderer not available - make sure productRenderer.js is loaded"
          );
          showErrorMessage();
        }
      })
      .catch((error) => {
        console.error("Error loading popular products:", error);
        showErrorMessage();
      });
  }

  /**
   * Shows error message when product data can't be loaded
   * Displays user-friendly error message in the grid container
   */
  function showErrorMessage() {
    document.getElementById("popular-products-grid").innerHTML = `
      <div class="error-message">
        <p>Sorry, we couldn't load the popular products.</p>
      </div>
    `;
  }
};

/**
 * Handles automated loading of the popular products component when
 * the dedicated container exists on the page
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if a container with the standard ID exists
  const defaultContainer = document.getElementById("popular-produce-container");

  // If the container exists and the load function is available, populate it
  if (defaultContainer && typeof window.loadPopularProduce === "function") {
    window.loadPopularProduce("popular-produce-container");
  }
});
