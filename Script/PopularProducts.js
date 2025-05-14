/**
 * PopularProducts.js - Popular Products Component Manager
 *
 * This refactored module creates and manages the "Popular Products" component
 * using HTML templates instead of generating HTML with template literals.
 *
 * It handles:
 * - Loading products data from the JSON source
 * - Filtering for products marked as "popular"
 * - Rendering products using the productRenderer module and templates
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
 * @returns {Promise<void>}
 */
window.loadPopularProduce = async function (containerId) {
  // Get the target container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID '${containerId}' not found`);
    return;
  }

  // Check if the container already has the structure
  let gridContainer = container.querySelector(".popular-produce__grid");

  // Create component structure if it doesn't exist
  if (!gridContainer) {
    container.innerHTML = `
      <section class="popular-produce">
        <div class="popular-produce__header">
          <h2 class="popular-produce__title">Popular Produce</h2>
        </div>
        <div id="popular-products-grid" class="popular-produce__grid"></div>
      </section>
    `;

    gridContainer = document.getElementById("popular-products-grid");
  }

  // Load products data
  await loadProductsData(gridContainer);
};

/**
 * Loads product data from JSON file
 * Fetches data, filters for popular products, and passes to renderer
 *
 * @param {HTMLElement} gridContainer - Container to display products in
 * @returns {Promise<void>}
 */
async function loadProductsData(gridContainer) {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();

    // Filter products to only show those marked as popular
    const popularProducts = data.products.filter((p) => p.popular);

    // Use the productRenderer to display products
    if (gridContainer && window.productRenderer) {
      // Note the await - displayProducts is now async
      await window.productRenderer.displayProducts(
        popularProducts,
        gridContainer
      );
    } else {
      console.error(
        "productRenderer not available - make sure productRenderer.js is loaded"
      );
      showErrorMessage(gridContainer);
    }
  } catch (error) {
    console.error("Error loading popular products:", error);
    showErrorMessage(gridContainer);
  }
}

/**
 * Shows error message when product data can't be loaded
 * Displays user-friendly error message in the grid container
 *
 * @param {HTMLElement} container - The container to show the error in
 * @returns {void}
 */
function showErrorMessage(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="error-message">
      <p>Sorry, we couldn't load the popular products.</p>
    </div>
  `;
}

/**
 * Handles automated loading of the popular products component when
 * the dedicated container exists on the page
 *
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  // Check if a container with the standard ID exists
  const defaultContainer = document.getElementById("popular-produce-container");

  // If the container exists and the load function is available, populate it
  if (defaultContainer && typeof window.loadPopularProduce === "function") {
    window.loadPopularProduce("popular-produce-container");
  }
});
