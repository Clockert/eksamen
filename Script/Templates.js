/**
 * Templates.js - Template loading and management
 *
 * This module handles loading HTML templates from the templates folder
 * and provides methods to instantiate them in the DOM.
 *
 * @author Clockert
 */

// Create a global templateLoader object
window.templateLoader = (function () {
  // Cache for loaded templates to avoid repeated fetches
  const templateCache = {};

  /**
   * Loads a template from the templates folder
   *
   * @param {string} templateName - Name of the template file without extension
   * @returns {Promise<string>} The template HTML content
   */
  async function loadTemplate(templateName) {
    // Check cache first
    if (templateCache[templateName]) {
      return templateCache[templateName];
    }

    try {
      const response = await fetch(`templates/${templateName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${templateName}`);
      }

      const html = await response.text();

      // Store in cache
      templateCache[templateName] = html;

      return html;
    } catch (error) {
      console.error(`Error loading template "${templateName}":`, error);
      return null;
    }
  }

  /**
   * Inserts a template into a container element
   *
   * @param {string} templateName - Name of the template file without extension
   * @param {string|Element} container - Container element or selector where to insert
   * @returns {Promise<Element>} The container element with template inserted
   */
  async function insertTemplate(templateName, container) {
    const templateHtml = await loadTemplate(templateName);
    if (!templateHtml) return null;

    // Get container element
    const containerElement =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!containerElement) {
      console.error(`Container not found: ${container}`);
      return null;
    }

    // Insert template
    containerElement.innerHTML = templateHtml;

    return containerElement;
  }

  /**
   * Creates an element from a template with data placeholders replaced
   * Good for repeating items like product cards, cart items, etc.
   *
   * @param {string} templateName - Name of the template file without extension
   * @param {Object} data - Data to populate the template with
   * @returns {Promise<DocumentFragment>} Document fragment with the template content
   */
  async function createFromTemplate(templateName, data = {}) {
    const templateHtml = await loadTemplate(templateName);
    if (!templateHtml) return null;

    // Create a template element to parse the HTML
    const template = document.createElement("template");

    // Replace placeholders with data
    let processedHtml = templateHtml;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      processedHtml = processedHtml.replace(regex, value);
    }

    template.innerHTML = processedHtml;

    return template.content.cloneNode(true);
  }

  /**
   * Loads multiple templates and inserts them into their respective containers
   *
   * @param {Array<Object>} templates - Array of {name, container} objects
   * @returns {Promise<void>}
   */
  async function loadTemplates(templates) {
    try {
      const promises = templates.map((template) =>
        insertTemplate(template.name, template.container)
      );

      await Promise.all(promises);

      console.log("All templates loaded successfully");
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  }

  // Public API
  return {
    loadTemplate,
    insertTemplate,
    createFromTemplate,
    loadTemplates,
  };
})();

// Load common templates when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Define templates to load on every page
  const commonTemplates = [
    { name: "navbar", container: "#navbar-container" },
    { name: "menu-overlay", container: "#menu-overlay-container" },
    { name: "cart-overlay", container: "#cart-overlay-container" },
    { name: "footer", container: "#footer-container" },
  ];

  // Load all common templates
  window.templateLoader
    .loadTemplates(commonTemplates)
    .then(() => {
      // After templates are loaded, initialize their functionality

      // Fire an event that templates are loaded so other scripts can initialize
      document.dispatchEvent(new CustomEvent("templates-loaded"));

      console.log("Common templates loaded and initialized");
    })
    .catch((error) => {
      console.error("Failed to load common templates:", error);
    });
});
