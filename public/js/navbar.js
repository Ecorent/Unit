// public/js/navbar.js
const navbarContainer = document.getElementById("navbar");

/* Reserve navbar space immediately */
navbarContainer.innerHTML = `
  <nav class="navbar navbar-skeleton"></nav>
`;

fetch("/partials/navbar.html")
  .then(res => res.text())
  .then(html => {
    navbarContainer.innerHTML = html;

    /* Load auth state logic */
    const authScript = document.createElement("script");
    authScript.type = "module";
    authScript.src = "/js/authState.js";
    document.body.appendChild(authScript);

    const profileToggle = document.getElementById("profileToggle");
    const profileDropdown = document.getElementById("profileDropdown");

    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    document.addEventListener("click", (e) => {
      /* Profile dropdown */
      if (profileToggle && profileDropdown) {
        if (profileToggle.contains(e.target)) {
          profileDropdown.classList.toggle("hidden");
        } else if (!profileDropdown.contains(e.target)) {
          profileDropdown.classList.add("hidden");
        }
      }

      /* Mobile menu */
      if (hamburgerToggle && mobileMenu) {
        if (hamburgerToggle.contains(e.target)) {
          mobileMenu.classList.toggle("hidden");
        } else if (!mobileMenu.contains(e.target)) {
          mobileMenu.classList.add("hidden");
        }
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
