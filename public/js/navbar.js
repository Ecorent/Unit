import { translations } from "/js/i18n.js";

const navbarContainer = document.getElementById("navbar");

fetch("/partials/navbar.html")
  .then(res => res.text())
  .then(html => {
    navbarContainer.innerHTML = html;

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
    const languageDropdown = document.getElementById("languageDropdown");
    const mobileLanguageToggle = document.getElementById("mobileLanguageToggle");
    const mobileLanguageDropdown = document.getElementById("mobileLanguageDropdown");

    const currentLangFlag = document.getElementById("currentLangFlag");
    const mobileCurrentLangFlag = document.getElementById("mobileCurrentLangFlag");

    let currentLang = localStorage.getItem("lang") || "en";

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".desktop-nav a, .mobile-menu a").forEach(link => {
      const linkPage = link.getAttribute("href")?.split("?")[0];
      if (linkPage === currentPage) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    function updateLangIcons(lang) {
      const className = lang === "es" ? "flag-es" : "flag-us";
      currentLangFlag.className = `lang-flag ${className}`;
      mobileCurrentLangFlag.className = `lang-flag ${className}`;
    }

    function applyLanguage(lang) {
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang]?.[key]) el.textContent = translations[lang][key];
      });

      document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (translations[lang]?.[key]) el.placeholder = translations[lang][key];
      });

      updateLangIcons(lang);
      document.documentElement.lang = lang;
      localStorage.setItem("lang", lang);

      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: lang })
      );
    }

    applyLanguage(currentLang);

    window.addEventListener("pageshow", () => {
      applyLanguage(localStorage.getItem("lang") || "en");
    });

    languageToggle?.addEventListener("click", e => {
      e.stopPropagation();
      profileDropdown?.classList.add("hidden");
      mobileProfileMenu?.classList.add("hidden");
      languageDropdown?.classList.toggle("hidden");
      languageToggle.setAttribute("aria-expanded", String(!languageDropdown?.classList.contains("hidden")));
    });

    mobileLanguageToggle?.addEventListener("click", e => {
      e.stopPropagation();
      mobileLanguageDropdown?.classList.toggle("hidden");
      mobileLanguageToggle.setAttribute("aria-expanded", String(!mobileLanguageDropdown?.classList.contains("hidden")));
    });

    languageDropdown?.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedLang = btn.dataset.lang;
        if (selectedLang) {
          currentLang = selectedLang;
          applyLanguage(currentLang);
          languageDropdown.classList.add("hidden");
          languageToggle?.setAttribute("aria-expanded", "false");
        }
      });
    });

    mobileLanguageDropdown?.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedLang = btn.dataset.lang;
        if (selectedLang) {
          currentLang = selectedLang;
          applyLanguage(currentLang);
          mobileLanguageDropdown.classList.add("hidden");
          mobileMenu?.classList.add("hidden");
          mobileLanguageToggle?.setAttribute("aria-expanded", "false");
          hamburgerToggle?.setAttribute("aria-expanded", "false");
        }
      });
    });

    function addTouchFeedback(el) {
      if (!el) return;
      el.addEventListener("pointerdown", () => el.classList.add("touch-active"));
      el.addEventListener("pointerup", () => el.classList.remove("touch-active"));
      el.addEventListener("pointerleave", () => el.classList.remove("touch-active"));
    }

    addTouchFeedback(hamburgerToggle);
    addTouchFeedback(profileToggle);
    addTouchFeedback(mobileProfileToggle);

    document.querySelectorAll(
      ".mobile-menu a, .mobile-menu button, .mobile-profile-menu a, .mobile-profile-menu button"
    ).forEach(el => {
      el.addEventListener("pointerdown", () => el.classList.add("touch-bg"));
      el.addEventListener("pointerup", () => el.classList.remove("touch-bg"));
      el.addEventListener("pointerleave", () => el.classList.remove("touch-bg"));
    });

    document.addEventListener("click", e => {
      const navbar = document.querySelector(".navbar");
      const isLoggedIn = navbar?.dataset.auth === "logged-in";

      if (isLoggedIn && profileToggle?.contains(e.target)) {
        languageDropdown?.classList.add("hidden");
        profileDropdown?.classList.toggle("hidden");
        profileToggle.setAttribute("aria-expanded", String(!profileDropdown?.classList.contains("hidden")));
      } else if (profileDropdown && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden");
        profileToggle?.setAttribute("aria-expanded", "false");
      }

      if (isLoggedIn && mobileProfileToggle?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
        mobileProfileMenu?.classList.toggle("hidden");
        hamburgerToggle?.setAttribute("aria-expanded", "false");
        mobileProfileToggle.setAttribute("aria-expanded", String(!mobileProfileMenu?.classList.contains("hidden")));
      } else if (mobileProfileMenu && !mobileProfileMenu.contains(e.target)) {
        mobileProfileMenu.classList.add("hidden");
        mobileProfileToggle?.setAttribute("aria-expanded", "false");
      }

      if (hamburgerToggle?.contains(e.target)) {
        mobileProfileMenu?.classList.add("hidden");
        mobileMenu?.classList.toggle("hidden");
        mobileProfileToggle?.setAttribute("aria-expanded", "false");
        hamburgerToggle.setAttribute("aria-expanded", String(!mobileMenu?.classList.contains("hidden")));
      } else if (!mobileMenu?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
        hamburgerToggle?.setAttribute("aria-expanded", "false");
      }

      if (
        languageDropdown &&
        !languageDropdown.contains(e.target) &&
        !languageToggle?.contains(e.target)
      ) {
        languageDropdown.classList.add("hidden");
        languageToggle?.setAttribute("aria-expanded", "false");
      }

      if (
        mobileLanguageDropdown &&
        !mobileLanguageDropdown.contains(e.target) &&
        !mobileLanguageToggle?.contains(e.target)
      ) {
        mobileLanguageDropdown.classList.add("hidden");
        mobileLanguageToggle?.setAttribute("aria-expanded", "false");
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
