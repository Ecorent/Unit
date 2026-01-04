// public/js/authState.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navbar = document.querySelector(".navbar");
  navbar?.classList.remove("auth-loading");

  const profileIcons = document.querySelectorAll(".profile-icon");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileToggle = document.getElementById("profileToggle");
  const mobileProfileToggle = document.getElementById("mobileProfileToggle");

  if (!profileToggle || !mobileProfileToggle) return;

  if (!user) {
    /* ---------- NOT LOGGED IN ---------- */

    // Explicit auth state
    navbar.dataset.auth = "logged-out";

    profileIcons.forEach(icon => {
      icon.className = "fas fa-user-circle profile-icon";
    });

    profileDropdown?.classList.add("hidden");

    const redirectToLogin = (e) => {
      e.stopPropagation(); // CRITICAL: prevents dropdown flash
      window.location.href = "/login.html";
    };

    profileToggle.onclick = redirectToLogin;
    mobileProfileToggle.onclick = redirectToLogin;

  } else {
    /* ---------- LOGGED IN ---------- */

    navbar.dataset.auth = "logged-in";

    profileIcons.forEach(icon => {
      icon.className = "profile-circle";
    });

    // Dropdown toggling handled by navbar.js
    profileToggle.onclick = null;
    mobileProfileToggle.onclick = null;
  }
});

/* ---------- LOGOUT ---------- */
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    await signOut(auth);
    window.location.href = "/index.html";
  }
});
