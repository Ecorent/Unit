// public/js/authState.js
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, () => {
  const navbar = document.querySelector(".navbar");
  navbar?.classList.remove("auth-loading");
});

/* ---------- Logout ---------- */
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn" || e.target.id === "mobileLogoutBtn") {
    await signOut(auth);
    window.location.href = "index.html";
  }
});
