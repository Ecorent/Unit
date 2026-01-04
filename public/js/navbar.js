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

    /* Load auth state logic AFTER navbar exists */
    const authScript = document.createElement("script");
    authScript.type = "module";
    authScript.src = "/js/authState.js";
    document.body.appendChild(authScript);

    const profileToggle = document.getElementById("profileToggle");
    const mobileProfileToggle = document.getElementById("mobileProfileToggle");
    const profileDropdown = document.getElementById("profileDropdown");

    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    document.addEventListener("click", (e) => {
      const navbar = document.querySelector(".navbar");
      const isLoggedIn = navbar?.dataset.auth === "logged-in";

      /* ---------- DESKTOP PROFILE DROPDOWN ---------- */
      if (
        isLoggedIn &&
        profileToggle?.contains(e.target)
      ) {
        profileDropdown?.classList.toggle("hidden");
        return;
      }

      if (profileDropdown && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden");
      }

      /* ---------- MOBILE PROFILE MENU ---------- */
      const mobileProfileMenu = document.getElementById("mobileProfileMenu");

      if (
        isLoggedIn &&
        mobileProfileToggle?.contains(e.target)
      ) {
        mobileProfileMenu?.classList.toggle("hidden");
        return;
      }

      if (mobileProfileMenu && !mobileProfileMenu.contains(e.target)) {
        mobileProfileMenu.classList.add("hidden");
      }

      /* ---------- HAMBURGER MENU ---------- */
      if (hamburgerToggle?.contains(e.target)) {
        mobileMenu?.classList.toggle("hidden");
      } else if (!mobileMenu?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
