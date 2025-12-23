// public/js/authState.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginLink = document.getElementById("loginLink");
const profileIcon = document.getElementById("profileIcon");

/* 1️⃣ Instant optimistic render */
if (auth.currentUser) {
  loginLink?.classList.add("hidden");
  profileIcon?.classList.remove("hidden");
} else {
  loginLink?.classList.remove("hidden");
  profileIcon?.classList.add("hidden");
}

/* 2️⃣ Firebase confirmation */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginLink?.classList.add("hidden");
    profileIcon?.classList.remove("hidden");
  } else {
    loginLink?.classList.remove("hidden");
    profileIcon?.classList.add("hidden");
  }
});
