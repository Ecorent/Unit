// public/js/authState.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const loginLink = document.getElementById("loginLink");
  const profileIcon = document.getElementById("profileIcon");

  if (!loginLink || !profileIcon) return;

  if (user) {
    loginLink.classList.add("hidden");
    profileIcon.classList.remove("hidden");
  } else {
    loginLink.classList.remove("hidden");
    profileIcon.classList.add("hidden");
  }
});
