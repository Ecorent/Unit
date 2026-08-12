// public/js/authState.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------- HELPER ---------- */
function getUserInitial(user) {
  if (!user) return "";

  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim().charAt(0).toUpperCase();
  }

  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return "";
}

function setAdminMenuVisible(isAdmin) {
  document.querySelectorAll(".admin-menu-item").forEach(item => {
    item.classList.toggle("hidden", !isAdmin);
  });

  document.querySelectorAll(".user-menu-item").forEach(item => {
    item.classList.toggle("hidden", isAdmin);
  });
}

async function getUserRole(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.exists() ? userDoc.data().role : "user";
  } catch (error) {
    console.error("Failed to load user role:", error);
    return "user";
  }
}

onAuthStateChanged(auth, async (user) => {
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
    navbar.dataset.role = "guest";
    setAdminMenuVisible(false);

    profileSlots.forEach(slot => {
      slot.innerHTML = `<i class="fas fa-user-circle profile-icon"></i>`;
    });

    profileDropdown?.classList.add("hidden");
    document.getElementById("mobileProfileMenu")?.classList.add("hidden");

    const redirectToLogin = (e) => {
      e.stopPropagation();
      sessionStorage.setItem("loginFrom", window.location.href);
      window.location.href = "/login.html";
    };

    profileToggle.onclick = redirectToLogin;
    mobileProfileToggle.onclick = redirectToLogin;

  } else {
    /* ---------- LOGGED IN ---------- */

    const role = await getUserRole(user);
    const isAdmin = role === "admin";

    navbar.dataset.auth = "logged-in";
    navbar.dataset.role = role;
    setAdminMenuVisible(isAdmin);

    const initial = getUserInitial(user);

    profileSlots.forEach(slot => {
      slot.innerHTML = `<span class="profile-circle">${initial}</span>`;
    });

    profileToggle.onclick = null;
    mobileProfileToggle.onclick = null;
  }

  /* Reveal navbar ONLY after auth is resolved */
  navbar.classList.remove("auth-loading");
});

/* ---------- LOGOUT ---------- */
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn" || e.target.matches("[data-logout-button]")) {
    await signOut(auth);
    window.location.href = "/index.html";
  }
});
