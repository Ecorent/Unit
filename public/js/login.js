// public/js/login.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------- ELEMENTS ----------
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordLink = document.getElementById("forgotPassword");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");

const signupNameInput = document.getElementById("signupName");
const signupPhoneInput = document.getElementById("signupPhone");
const signupEmailInput = document.getElementById("signupEmail");
const signupPasswordInput = document.getElementById("signupPassword");

// ---------- TAB SWITCHING ----------
loginTab.onclick = () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
};

signupTab.onclick = () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.add("active");
  loginForm.classList.remove("active");
};

// ---------- SIGN UP ----------
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupNameInput.value.trim();
  const phone = signupPhoneInput.value.trim();
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      name,
      phone,
      email,
      role: "user",
      createdAt: new Date()
    });

    // Sign out immediately after signup
    await auth.signOut();

    // Reset only email + password after success as well
    signupNameInput.value = "";
    signupPhoneInput.value = "";
    signupEmailInput.value = "";
    signupPasswordInput.value = "";
    loginTab.click();

  } catch (error) {
    alert(error.message);
    signupNameInput.value = "";
    signupPhoneInput.value = "";
    signupEmailInput.value = "";
    signupPasswordInput.value = "";
    signupNameInput.focus();
  }
});

// ---------- LOGIN ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role === "admin") {
      // 🔥 Force logout of any existing admin (Sanity included)
      await auth.signOut();

      // 🔑 Fresh login for this admin
      await signInWithEmailAndPassword(auth, email, password);

      sessionStorage.setItem("sanityLogin", "true");
      window.open("/sanity", "_blank");
      window.location.href = "/index.html";
    }
    else {
      window.location.href = "/index.html";
    }

  } catch {
    alert("Invalid email or password");

    // Clear incorrect credentials
    loginEmailInput.value = "";
    loginPasswordInput.value = "";
    loginEmailInput.focus();
  }
});

// ---------- FORGOT PASSWORD (DISABLED) ----------
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/forgot-password.html";
});
