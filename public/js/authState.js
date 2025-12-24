// public/js/authState.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const navbar = document.querySelector(".navbar");
  const loginLink = document.getElementById("loginLink");
  const profileWrapper = document.getElementById("profileIcon");

  if (!navbar) return;

  loginLink?.classList.add("hidden");
  profileWrapper?.classList.add("hidden");

  if (user) {
    profileWrapper?.classList.remove("hidden");
  } else {
    loginLink?.classList.remove("hidden");
  }

  navbar.classList.remove("auth-loading");
});

/* ---------- Logout ---------- */

document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    await signOut(auth);
    window.location.href = "index.html";
  }
});
