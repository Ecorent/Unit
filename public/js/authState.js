// public/js/authState.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const profileSlots = document.querySelectorAll(".profile-slot");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileToggle = document.getElementById("profileToggle");
  const mobileProfileToggle = document.getElementById("mobileProfileToggle");

  if (!profileToggle || !mobileProfileToggle) return;

  if (!user) {
    /* ---------- NOT LOGGED IN ---------- */

    navbar.dataset.auth = "logged-out";

    profileSlots.forEach(slot => {
      slot.innerHTML = `<i class="fas fa-user-circle profile-icon"></i>`;
    });

    profileDropdown?.classList.add("hidden");

    const redirectToLogin = (e) => {
      e.stopPropagation();
      window.location.href = "/login.html";
    };

    profileToggle.onclick = redirectToLogin;
    mobileProfileToggle.onclick = redirectToLogin;

  } else {
    /* ---------- LOGGED IN ---------- */

    navbar.dataset.auth = "logged-in";

    profileSlots.forEach(slot => {
      slot.innerHTML = `<span class="profile-circle"></span>`;
    });

    profileToggle.onclick = null;
    mobileProfileToggle.onclick = null;
  }

  /* Reveal navbar ONLY after final state */
  navbar.classList.remove("auth-loading");
});

/* ---------- LOGOUT ---------- */
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    await signOut(auth);
    window.location.href = "/index.html";
  }
});
