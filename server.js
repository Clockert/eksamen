// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Load environment variables
dotenv.config();

// Log loaded environment variables (don't log actual API keys in production!)
console.log("Environment variables loaded:");
console.log(
  "- OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "Set ✓" : "Not set ✗"
);
console.log("- FDC_API_KEY:", process.env.FDC_API_KEY ? "Set ✓" : "Not set ✗");

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "./")));

// API endpoint to proxy OpenAI requests
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
            content:
              "You are a helpful assistant for a sustainable food delivery service called Fram in Norway. You know about local farming practices, seasonal produce, sustainable agriculture, and Fram's services. Keep responses concise (under 50 words when possible), friendly, and focused on sustainability.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 150,
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

// API endpoint to fetch nutrition data from Food Data Central API
app.get("/api/nutrition/:query", async (req, res) => {
  try {
    // Extract the food query parameter from the URL
    const { query } = req.params;

    console.log(` Nutrition API request received for: "${query}"`);

    // Get API key from environment variable
    const apiKey = process.env.FDC_API_KEY;

    // Check if API key exists
    if (!apiKey) {
      console.error(
        " Food Data Central API key not found in environment variables"
      );
      return res.status(500).json({
        error:
          "Food Data Central API key not configured. Please add FDC_API_KEY to your .env file.",
      });
    }

    console.log("✓ API key found, preparing to fetch nutrition data");

    // Create the URL for the Food Data Central API request
    const apiUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}&dataType=Foundation,SR%20Legacy`;

    console.log(` Searching for "${query}" in Food Data Central database`);

    // Make request to Food Data Central API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      console.error(
        ` Food Data Central API responded with status: ${response.status}`
      );
      throw new Error(
        `Food Data Central API responded with status: ${response.status}`
      );
    }

    // Parse the JSON response
    const data = await response.json();

    // Log some information about the results
    console.log(
      ` Nutrition data received. Found ${data.foods?.length || 0} food items.`
    );
    if (data.foods && data.foods.length > 0) {
      console.log(
        ` First result: "${data.foods[0].description}" with ${
          data.foods[0].foodNutrients?.length || 0
        } nutrients`
      );
    }

    // Send the nutrition data back to the client
    res.json(data);
  } catch (error) {
    console.error(" Error fetching nutrition data:", error.message);
    res.status(500).json({
      error: "Failed to fetch nutrition data. Please try again later.",
    });
  }
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(` ${req.method} request to ${req.url}`);
  next();
});

// Start the server
app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
  console.log(` API endpoints available:`);
  console.log(`   - POST /api/chat - ChatGPT integration`);
  console.log(`   - GET /api/nutrition/:query - Food nutrition data`);
  console.log(
    ` accessing http://localhost:${port}/api/nutrition/carrots in browser to test the nutrition API`
  );
});
