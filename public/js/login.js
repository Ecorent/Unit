// public/js/login.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
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

  const name = document.getElementById("signupName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Store user profile in Firestore
    await setDoc(doc(db, "users", uid), {
      name,
      phone,
      email,
      role: "user", // default role
      createdAt: new Date()
    });

    alert("Account created successfully!");
    window.location.href = "/index.html";

  } catch (error) {
    alert(error.message);
  }
});

// ---------- LOGIN ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Fetch user role
    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    // Redirect based on role
    if (role === "admin") {
      window.location.href = "/sanity";
    } else {
      window.location.href = "/index.html";
    }

  } catch (error) {
    alert("Invalid email or password");
  }
});

// ---------- PASSWORD RESET ----------
forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent!");
  } catch (error) {
    alert(error.message);
  }
});
