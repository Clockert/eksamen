function loadNavbar() {
  const navbarHTML = `
    <header>
      <nav class="navbar">
        <!-- Font Awesome Hamburger -->
        <button class="hamburger">
          <img src="assets/bars.png" alt="Menu" class="hamburger-icon" />
        </button>

        <!-- Center Logo -->
        <div class="logo">Fram</div>

        <!-- Right Green Button -->
        <button class="green-btn">0</button>
      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbarHTML);
}

// Call the function to load the navbar
loadNavbar();
