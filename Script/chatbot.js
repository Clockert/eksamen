/**
 * FRAM Chatbot - Handles user interactions with the AI chatbot
 *
 * This module manages the chat interface, including:
 * - Sending and receiving messages
 * - Loading states
 * - Error handling
 * - Message display
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const chatboxInner = document.querySelector(".chatbox-inner");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const buttonIcon = document.getElementById("button-icon");
  const chatbox = document.querySelector(".chatbox");

  // Chat state - tracks current chat status
  const chatState = {
    isConnected: true, // Connection to API is established
    isLoading: false, // Waiting for a response
  };

  // CORE FUNCTIONS

  /**
   * Handles sending user messages and receiving bot responses
   */
  async function handleUserInput() {
    const message = userInput.value.trim();

    // Don't process empty messages or when system is busy
    if (!message || !chatState.isConnected || chatState.isLoading) return;

    // Send user message
    addMessage(message, "outgoing");
    userInput.value = ""; // Clear input field

    // Update UI to loading state
    chatState.isLoading = true;
    updateButtonState();
    const loadingBubble = addLoadingMessage();

    try {
      // Send to API and get response (currently simulated)
      const botResponse = await fetchBotResponse(message);

      // Show response
      chatboxInner.removeChild(loadingBubble);
      addMessage(botResponse, "incoming");
    } catch (error) {
      console.error("Error getting response:", error);

      // Show error message
      chatboxInner.removeChild(loadingBubble);
      addMessage(
        "Sorry, I couldn't process your request. Please try again.",
        "incoming"
      );
    } finally {
      // Reset loading state
      chatState.isLoading = false;
      updateButtonState();
    }
  }

  /**
   * Gets response from OpenAI API
   * @param {string} userMessage - The message from the user
   * @returns {Promise<string>} Bot's response
   */
  async function fetchBotResponse(userMessage) {
    try {
      // Get API key
      const apiKey = "YOUR_OPENAI_API_KEY_HERE";

      // Check if we have an API key
      if (!apiKey || apiKey === "YOUR_OPENAI_API_KEY_HERE") {
        return "API key not configured. Please set up the OpenAI API key to enable AI responses.";
      }

      // Make request to OpenAI API
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
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
                  "You are a helpful assistant for a sustainable food delivery service called Fram in Norway. Yo want other farms to Partner up with FRAM. You know about local farming practices, seasonal produce, sustainable agriculture, and Fram's services. Keep responses concise (under 50 words when possible), friendly, and focused on sustainability.",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        }
      );

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error?.message ||
          `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Parse the JSON response
      const data = await response.json();

      // Extract the AI's message from the response
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw new Error(
        "Failed to get a response from our AI. Please try again later."
      );
    }
  }

  // UI FUNCTIONS

  /**
   * Updates the send button appearance based on current chat state
   */
  function updateButtonState() {
    sendButton.classList.toggle("loading", chatState.isLoading);
    sendButton.classList.toggle("disconnected", !chatState.isConnected);

    buttonIcon.innerHTML =
      chatState.isLoading || !chatState.isConnected
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-arrow-up"></i>';
  }

  /**
   * Adds a message to the chat display
   * @param {string} message - Text content of the message
   * @param {string} type - Message type: "incoming" (bot) or "outgoing" (user)
   * @returns {HTMLElement} The created message element
   */
  function addMessage(message, type) {
    const messageElement = document.createElement("li");
    messageElement.className = `chat ${type}`;

    // Add FRAM logo for bot messages
    if (type === "incoming") {
      const logo = document.createElement("span");
      logo.className = "logo";
      logo.innerHTML = "<p>Fram</p>";
      messageElement.appendChild(logo);
    }

    // Add message text
    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageElement.appendChild(messageText);

    // Add to chatbox and scroll to view
    chatboxInner.appendChild(messageElement);
    scrollToBottom();

    return messageElement;
  }

  /**
   * Adds a loading indicator message
   * @returns {HTMLElement} The created loading message element
   */
  function addLoadingMessage() {
    const loadingElement = document.createElement("li");
    loadingElement.className = "chat incoming loading-message";

    // Add Fram logo
    const logo = document.createElement("span");
    logo.className = "logo";
    logo.innerHTML = "<p>Fram</p>";
    loadingElement.appendChild(logo);

    // Create dots container for animation
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "dots-container";

    // Create three animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dotsContainer.appendChild(dot);
    }

    loadingElement.appendChild(dotsContainer);
    chatboxInner.appendChild(loadingElement);
    scrollToBottom();

    return loadingElement;
  }

  /**
   * Adds an error message for connection issues
   * @returns {HTMLElement} The created error message element
   */
  function addConnectionErrorMessage() {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll(".connection-error");
    existingErrors.forEach((error) => chatboxInner.removeChild(error));

    // Create error message element
    const errorElement = document.createElement("div");
    errorElement.className = "connection-error";
    errorElement.textContent = "Failed to connect. Please try again later.";

    // Add to chatbox and scroll
    chatboxInner.appendChild(errorElement);
    scrollToBottom();

    return errorElement;
  }

  /**
   * Scrolls the chat to the most recent message
   */
  function scrollToBottom() {
    const lastElement = chatboxInner.lastElementChild;
    if (lastElement) {
      // Smooth scroll to the last message
      setTimeout(() => {
        lastElement.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 10);
    } else {
      // Fallback if no elements exist
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  }

  // EVENT LISTENERS

  // Send button click handler
  sendButton.addEventListener("click", () => {
    if (chatState.isLoading) {
      // Cancel if loading
      chatState.isLoading = false;
      updateButtonState();

      // Remove loading message if present
      const loadingMessage = document.querySelector(".loading-message");
      if (loadingMessage) {
        chatboxInner.removeChild(loadingMessage);
      }
    } else {
      handleUserInput();
    }
  });

  // Enter key submission
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleUserInput();
    }
  });

  // INITIALIZATION

  // Focus input field when chat loads
  userInput.focus();

  // Initialize chat with welcome message
  setTimeout(() => {
    addMessage("What can I help you with today?", "incoming");
  }, 100); // Small delay to ensure DOM is fully ready
  updateButtonState();
});
