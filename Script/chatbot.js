/**
 * FRAM Chatbot - Handles user interactions with the AI chatbot
 *
 * This module manages the chat interface for Fram's AI assistant, including:
 * - Sending and receiving messages between user and OpenAI API
 * - Managing loading states and visual feedback
 * - Handling error conditions gracefully
 * - Formatting and displaying messages in the chat UI
 *
 * The chatbot connects to a server-side proxy that interfaces with OpenAI's API,
 * protecting API keys and adding contextual system prompts about Fram's products.
 *
 * @author Clockert
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const chatboxInner = document.querySelector(".chatbot__messages-inner");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const buttonIcon = document.getElementById("button-icon");
  const chatbox = document.querySelector(".chatbot__messages");

  /**
   * @typedef {Object} ChatState - Tracks the current state of the chat interface
   * @property {boolean} isConnected - Whether a connection to the API is established
   * @property {boolean} isLoading - Whether a request is currently in progress
   */

  /**
   * Current state of the chat system
   *
   * @type {ChatState}
   */
  const chatState = {
    isConnected: true, // Connection to API is established
    isLoading: false, // Waiting for a response
  };

  // CORE FUNCTIONS

  /**
   * Handles sending user messages and receiving bot responses
   * Manages the entire message flow including UI updates and error handling
   *
   * @returns {Promise<void>}
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
      // Send to API and get response
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
   * Gets response from OpenAI API via our server proxy endpoint
   *
   * @param {string} userMessage - The message from the user
   * @returns {Promise<string>} Bot's response
   * @throws {Error} If API call fails
   */
  async function fetchBotResponse(userMessage) {
    try {
      // Call our server endpoint instead of OpenAI directly
      // This keeps API keys secure and allows server-side prompt enhancement
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error calling API:", error);
      throw new Error("Failed to get a response. Please try again later.");
    }
  }

  // UI FUNCTIONS

  /**
   * Updates the send button appearance based on current chat state
   * Changes icon and styles depending on loading/connection status
   *
   * @returns {void}
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
   *
   * @param {string} message - Text content of the message
   * @param {string} type - Message type: "incoming" (bot) or "outgoing" (user)
   * @returns {HTMLElement} The created message element
   */
  function addMessage(message, type) {
    const messageElement = document.createElement("li");
    messageElement.className = `chatbot__message chatbot__message--${type}`;

    // Add FRAM logo for bot messages
    if (type === "incoming") {
      const logo = document.createElement("span");
      logo.className = "chatbot__logo";
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
   * Creates animated dots to show the bot is "thinking"
   *
   * @returns {HTMLElement} The created loading message element
   */
  function addLoadingMessage() {
    const loadingElement = document.createElement("li");
    loadingElement.className =
      "chatbot__message chatbot__message--incoming chatbot__message--loading";

    // Add Fram logo
    const logo = document.createElement("span");
    logo.className = "chatbot__logo";
    logo.innerHTML = "<p>Fram</p>";
    loadingElement.appendChild(logo);

    // Create dots container for animation
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "chatbot__loading-dots";

    // Create three animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "chatbot__loading-dot";
      dotsContainer.appendChild(dot);
    }

    loadingElement.appendChild(dotsContainer);
    chatboxInner.appendChild(loadingElement);
    scrollToBottom();

    return loadingElement;
  }

  /**
   * Adds an error message for connection issues
   *
   * @returns {HTMLElement} The created error message element
   */
  function addConnectionErrorMessage() {
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll(
      ".chatbot__connection-error"
    );
    existingErrors.forEach((error) => chatboxInner.removeChild(error));

    // Create error message element
    const errorElement = document.createElement("div");
    errorElement.className = "chatbot__connection-error";
    errorElement.textContent = "Failed to connect. Please try again later.";

    // Add to chatbox and scroll
    chatboxInner.appendChild(errorElement);
    scrollToBottom();

    return errorElement;
  }

  /**
   * Scrolls the chat to the most recent message
   * Uses smooth scrolling for better UX
   *
   * @returns {void}
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
      const loadingMessage = document.querySelector(
        ".chatbot__message--loading"
      );
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
