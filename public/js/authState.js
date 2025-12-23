// public/js/authState.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navbar = document.querySelector(".navbar");
  const loginLink = document.getElementById("loginLink");
  const profileIcon = document.getElementById("profileIcon");

  if (!navbar) return;

  // Safety: hide both first
  if (loginLink) loginLink.classList.add("hidden");
  if (profileIcon) profileIcon.classList.add("hidden");

  if (user) {
    // Logged in
    if (profileIcon) profileIcon.classList.remove("hidden");
  } else {
    // Logged out
    if (loginLink) loginLink.classList.remove("hidden");
  }

  // Reveal navbar AFTER auth is resolved
  navbar.classList.add("ready");
});
