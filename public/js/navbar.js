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
    });

    mobileLanguageToggle?.addEventListener("click", e => {
      e.stopPropagation();
      mobileLanguageDropdown?.classList.toggle("hidden");
    });

    languageDropdown?.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const selectedLang = btn.dataset.lang;
        if (selectedLang) {
          currentLang = selectedLang;
          applyLanguage(currentLang);
          languageDropdown.classList.add("hidden");
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
      } else if (profileDropdown && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add("hidden");
      }

      if (isLoggedIn && mobileProfileToggle?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
        mobileProfileMenu?.classList.toggle("hidden");
      } else if (mobileProfileMenu && !mobileProfileMenu.contains(e.target)) {
        mobileProfileMenu.classList.add("hidden");
      }

      if (hamburgerToggle?.contains(e.target)) {
        mobileProfileMenu?.classList.add("hidden");
        mobileMenu?.classList.toggle("hidden");
      } else if (!mobileMenu?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
      }

      if (
        languageDropdown &&
        !languageDropdown.contains(e.target) &&
        !languageToggle?.contains(e.target)
      ) {
        languageDropdown.classList.add("hidden");
      }

      if (
        mobileLanguageDropdown &&
        !mobileLanguageDropdown.contains(e.target) &&
        !mobileLanguageToggle?.contains(e.target)
      ) {
        mobileLanguageDropdown.classList.add("hidden");
      }
    });
  })
  .catch(err => console.error("Failed to load navbar:", err));
