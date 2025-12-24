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

    /* ---------- Profile dropdown logic ---------- */
    const toggle = document.getElementById("profileToggle");
    const dropdown = document.getElementById("profileDropdown");

    document.addEventListener("click", (e) => {
      if (!toggle || !dropdown) return;

      if (toggle.contains(e.target)) {
        dropdown.classList.toggle("hidden");
      } else if (!dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
