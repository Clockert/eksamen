// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Load environment variables
dotenv.config();

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

// This endpoint will be used to get nutrition information for products
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
    )}&dataType=Foundation,SR%20Legacy`;

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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
