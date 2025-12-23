// public/js/authState.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginLink = document.getElementById("loginLink");
const profileIcon = document.getElementById("profileIcon");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User logged in
    if (loginLink) loginLink.classList.add("hidden");
    if (profileIcon) profileIcon.classList.remove("hidden");
  } else {
    // User logged out
    if (loginLink) loginLink.classList.remove("hidden");
    if (profileIcon) profileIcon.classList.add("hidden");
  }
});
