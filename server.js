/**
 * Fram Food Delivery - Server
 *
 * This server provides backend functionality for the Fram Food Delivery website:
 * 1. Proxies requests to the OpenAI API, adding system prompts with product information
 * 2. Connects to the USDA Food Data Central API for nutrition information
 * 3. Serves product data from local JSON
 * 4. Serves static files for the frontend
 *
 * The server keeps API keys secure and enhances requests with additional context
 * before forwarding them to third-party services.
 *
 * @author Clockert
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes and parse JSON request bodies
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, "./")));

/**
 * API endpoint to proxy OpenAI requests with enhanced system prompt
 * Creates a dynamic system prompt that includes current product information
 *
 * @route POST /api/chat
 * @param {Object} req.body.message - User message to send to OpenAI
 * @returns {Object} OpenAI API response
 * @throws {Error} If API key is missing or API call fails
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "API key not configured on server. Please add OPENAI_API_KEY to your .env file.",
      });
    }

    // Get current products from data source
    let productsData;
    try {
      const rawData = fs.readFileSync(
        path.join(__dirname, "Data/products.json"),
        "utf8"
      );
      productsData = JSON.parse(rawData);
    } catch (err) {
      console.error("Error reading products data:", err);
      // Fallback to empty product list if file can't be read
      productsData = { products: [] };
    }

    // Create formatted product list for the prompt
    const productsList = productsData.products
      .map(
        (p) => `- ${p.name} (${p.price}${p.quantity ? ", " + p.quantity : ""})`
      )
      .join("\n");

    // Create the dynamic system prompt with current products and enhanced guidance
    const systemPrompt = `
You are a helpful assistant for Fram, a sustainable food delivery service in Norway. 

KEY INFORMATION ABOUT FRAM:
- Fram connects customers directly with fresh products from local farms in Norway
- All partner farms follow sustainable and ecological agricultural practices
- We offer seasonal produce with an emphasis on local Norwegian varieties
- Our main partner farm is Braastad Gaard in Hamar region
- We use a circular container system where packaging is collected, cleaned, and reused
- Deliveries occur within 48 hours of harvest for maximum freshness
- We focus on transparency about where food comes from and how it's grown

CURRENT SEASONAL PRODUCTS IN STOCK:
${productsList}

YOUR PERSONALITY:
- Friendly, warm, and conversational 
- Knowledgeable about Norwegian agriculture and sustainability
- Passionate about local food systems and reducing food miles
- Helpful with practical advice about seasonal eating

WHEN ANSWERING QUESTIONS:
- Keep responses concise and friendly (under 50 words when possible)
- Highlight sustainability benefits when relevant
- Recommend seasonal products based on the current month in Norway
- For May produce, emphasize: radishes, spring onions, early lettuce, rhubarb, and greenhouse tomatoes
- If asked about nutrition info, mention customers can see detailed nutrition on individual product pages
- Always suggest visiting our product pages to see the current selection
- When customers ask about available products, recommend items from our current stock list
- Provide accurate pricing information from our product list when asked
- Never make up specific information about prices, delivery areas, or other logistics

COMMON QUESTIONS YOU SHOULD HANDLE WELL:
- Delivery areas and timeframes
- How the packaging return system works
- Seasonal availability of products
- Information about our partner farms
- Benefits of eating locally and seasonally
- How to place an order
- Dietary restrictions and accommodations

If you're unable to answer a specific question about Fram due to lack of information, acknowledge this politely and offer to help with general information about sustainable food or suggest they contact customer service for specific details.
`;

    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

/**
 * API endpoint to retrieve nutrition information for products
 * Proxies requests to the USDA Food Data Central API
 *
 * @route GET /api/nutrition/:query
 * @param {string} req.params.query - The product name to search for nutrition data
 * @returns {Object} Nutrition data from USDA Food Data Central API
 * @throws {Error} If API key is missing or API call fails
 */
app.get("/api/nutrition/:query", async (req, res) => {
  try {
    // Extract the food query parameter from the URL
    const { query } = req.params;

    // Get API key from environment variable - never expose API keys in client-side code
    const apiKey = process.env.FDC_API_KEY;

    // Check if API key exists
    if (!apiKey) {
      return res.status(500).json({
        error:
          "Food Data Central API key not configured. Please add FDC_API_KEY to your .env file.",
      });
    }

    // Create the URL for the Food Data Central API request
    // We're using the search endpoint to find foods matching our query
    // The dataType parameter filters for standard reference and foundation foods
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&dataType=Foundation&pageSize=1&sortBy=dataType.keyword&sortOrder=asc`;

    console.log(`Fetching nutrition data for: ${query}`);

    // Make request to Food Data Central API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(
        `Food Data Central API responded with status: ${response.status}`
      );
    }

    // Parse the JSON response
    const data = await response.json();

    // Send the nutrition data back to the client
    res.json(data);
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Error fetching nutrition data:", error);

    // Send an error response to the client
    // We don't expose the exact error details to the client for security
    res.status(500).json({
      error: "Failed to fetch nutrition data. Please try again later.",
    });
  }
});

/**
 * API endpoint to get available products
 * Reads product data from the local JSON file
 *
 * @route GET /api/products
 * @returns {Object} JSON object containing all product data
 * @throws {Error} If file reading fails
 */
app.get("/api/products", (req, res) => {
  try {
    const rawData = fs.readFileSync(
      path.join(__dirname, "Data/products.json"),
      "utf8"
    );
    const productsData = JSON.parse(rawData);
    res.json(productsData);
  } catch (error) {
    console.error("Error reading products data:", error);
    res.status(500).json({
      error: "Failed to fetch product data. Please try again later.",
    });
  }
});

/**
 * Start the server and listen on the specified port
 * Logs a message when the server is ready
 */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
