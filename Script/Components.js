function loadNavbar() {
  const navbarHTML = `
    <header>
      <nav class="navbar">
        <!-- Hamburger menu -->
        <button class="hamburger" id="open-menu" aria-label="Open menu">
          <img src="assets/bars.png" alt="Menu" class="hamburger-icon" />
        </button>

        <!-- Center Logo -->
        <div class="logo">Fram</div>

        <!-- Right Green Button -->
        <button class="green-btn">0</button>
      </nav>
    </header>

    <!-- Menu overlay -->
    <div id="menu-overlay" class="menu-overlay menu-hidden">
      <div class="menu-header">
        <button id="close-menu" class="close-button" aria-label="Close menu">
          ✕
        </button>
      </div>

      <div class="menu-content">
        <nav>
          <ul class="menu-nav">
            <li class="menu-nav-item">
              <a href="#products" class="menu-nav-link">Products</a>
            </li>
            <li class="menu-nav-item">
              <a href="#chat" class="menu-nav-link">Chat</a>
            </li>
          </ul>
        </nav>
        <a href="#checkout" class="checkout-link">Checkout</a>
      </div>
    </div>
  `;

  // Insert navbar and menu overlay
  document.body.insertAdjacentHTML("afterbegin", navbarHTML);

  // Setup event listeners once elements exist in the DOM
  const openMenuBtn = document.getElementById("open-menu");
  const closeMenuBtn = document.getElementById("close-menu");
  const menuOverlay = document.getElementById("menu-overlay");

  openMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.remove("menu-hidden");
  });

  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("menu-hidden");
  });
}

function loadFooter() {
  const footerHTML = `
    <footer>
      <div class="logo">Fram</div>

      <hr class="footer-divider" aria-hidden="true" />

      <div class="footer-content">
        <div class="footer-text">
          <h2>Stay updated</h2>
          <p>
            Sign up for our newsletter to be the first to know about new produce
            or other exciting news!
          </p>
        </div>

        <form
          class="subscribeform"
          action="/subscribe"
          method="post"
          aria-labelledby="newsletter-heading"
        >
          <span id="newsletter-heading" class="visually-hidden">
            Newsletter Signup
          </span>

          <label for="first-name" class="visually-hidden">First Name</label>
          <input
            type="text"
            id="first-name"
            name="first-name"
            placeholder="First name"
            required
          />

          <label for="email" class="visually-hidden">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail address"
            required
          />

          <button type="submit">Send</button>
        </form>
      </div>
    </footer>
  `;

  // Insert footer at end of body
  document.body.insertAdjacentHTML("beforeend", footerHTML);
}

// Load navbar and footer when page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  loadFooter();
});
