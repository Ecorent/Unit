// public/js/navbar.js
import { translations } from "/js/i18n.js";
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
    const mobileProfileMenu = document.getElementById("mobileProfileMenu");

    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    const languageToggle = document.getElementById("languageToggle");

    /* ---------- Translation Handling ---------- */

    let currentLang = localStorage.getItem("lang") || "en";

    function applyLanguage(lang) {
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang]?.[key]) {
          el.textContent = translations[lang][key];
        }
      });

      document.documentElement.lang = lang;
      localStorage.setItem("lang", lang);
    }

    // Initial load
    applyLanguage(currentLang);

    // Toggle language
    languageToggle?.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "es" : "en";
      applyLanguage(currentLang);
    });

    /* ---------- TOUCH FEEDBACK (MOBILE SAFE) ---------- */
    function addTouchFeedback(el) {
      if (!el) return;

      el.addEventListener("pointerdown", () => {
        el.classList.add("touch-active");
      });

      el.addEventListener("pointerup", () => {
        el.classList.remove("touch-active");
      });

      el.addEventListener("pointerleave", () => {
        el.classList.remove("touch-active");
      });
    }

    addTouchFeedback(hamburgerToggle);
    addTouchFeedback(profileToggle);
    addTouchFeedback(mobileProfileToggle);

    document.querySelectorAll(
      ".mobile-menu a, .mobile-profile-menu a, .mobile-profile-menu button"
    ).forEach(el => {
      el.addEventListener("pointerdown", () => {
        el.classList.add("touch-bg");
      });
      el.addEventListener("pointerup", () => {
        el.classList.remove("touch-bg");
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("touch-bg");
      });
    });

    /* ---------- CLICK LOGIC ---------- */
    document.addEventListener("click", (e) => {
      const navbar = document.querySelector(".navbar");
      const isLoggedIn = navbar?.dataset.auth === "logged-in";

      /* DESKTOP PROFILE DROPDOWN */
      if (isLoggedIn && profileToggle?.contains(e.target)) {
        profileDropdown?.classList.toggle("hidden");
      } else if (profileDropdown && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden");
      }

      /* MOBILE PROFILE MENU */
      if (isLoggedIn && mobileProfileToggle?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
        mobileProfileMenu?.classList.toggle("hidden");
      } else if (
        mobileProfileMenu &&
        !mobileProfileMenu.contains(e.target)
      ) {
        mobileProfileMenu.classList.add("hidden");
      }

      /* HAMBURGER MENU */
      if (hamburgerToggle?.contains(e.target)) {
        mobileProfileMenu?.classList.add("hidden");
        mobileMenu?.classList.toggle("hidden");
      } else if (!mobileMenu?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
