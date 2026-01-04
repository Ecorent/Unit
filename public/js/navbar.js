// public/js/navbar.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const navbarContainer = document.getElementById("navbar");

/* Reserve navbar space immediately */
navbarContainer.innerHTML = `
  <nav class="navbar navbar-skeleton"></nav>
`;

fetch("/partials/navbar.html")
  .then(res => res.text())
  .then(html => {
    navbarContainer.innerHTML = html;

    /* Load auth visual state */
    const authScript = document.createElement("script");
    authScript.type = "module";
    authScript.src = "/js/authState.js";
    document.body.appendChild(authScript);

    const profileToggle = document.getElementById("profileToggle");
    const mobileProfileToggle = document.getElementById("mobileProfileToggle");
    const profileDropdown = document.getElementById("profileDropdown");

    const hamburgerToggle = document.getElementById("hamburgerToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    let currentUser = null;
    let currentRole = null;

    /* Track auth + role */
    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      currentRole = null;

      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        currentRole = snap.exists() ? snap.data().role : "user";
      }
    });

    /* Profile click handler */
    const handleProfileClick = async () => {
      if (!currentUser) {
        window.location.href = "/index.html";
        return;
      }

      if (currentRole === "admin") {
        window.open("/sanity", "_blank");
      } else {
        window.location.href = "/index.html";
      }
    };

    profileToggle?.addEventListener("click", (e) => {
      e.stopPropagation();

      if (!currentUser) {
        handleProfileClick();
        return;
      }

      profileDropdown.classList.toggle("hidden");
    });

    mobileProfileToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      handleProfileClick();
    });

    document.addEventListener("click", (e) => {
      /* Close profile dropdown */
      if (
        profileDropdown &&
        !profileDropdown.contains(e.target) &&
        !profileToggle?.contains(e.target)
      ) {
        profileDropdown.classList.add("hidden");
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
