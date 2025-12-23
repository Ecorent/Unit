// public/js/authState.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navbar = document.querySelector(".navbar");
  const loginLink = document.getElementById("loginLink");
  const profileIcon = document.getElementById("profileIcon");

  if (!navbar) return;

  // Hide both first (safe reset)
  loginLink?.classList.add("hidden");
  profileIcon?.classList.add("hidden");

  if (user) {
    // Logged in → show profile icon
    profileIcon?.classList.remove("hidden");
  } else {
    // Logged out → show login
    loginLink?.classList.remove("hidden");
  }
  navbar.classList.remove("auth-loading");
  navbar.classList.add("ready");
});
