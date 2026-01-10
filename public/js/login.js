import { auth, db } from "./firebase.js";
import { initI18n } from "/js/i18n.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------- INIT I18N ---------- */
initI18n();

/* ---------- GOOGLE PROVIDER ---------- */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
auth.useDeviceLanguage();

/* ---------- CLEAN FORGOT FROM BACK STACK (MOBILE SAFE) ---------- */
const isMobile = window.matchMedia("(max-width: 768px)").matches;

if (isMobile && document.referrer.includes("forgot-password")) {
  history.replaceState(null, "", "/login.html");
}

/* =========================
   ELEMENTS
========================= */
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordLink = document.getElementById("forgotPassword");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginButton = loginForm.querySelector("button[type='submit']");
const googleLoginBtn = loginForm.querySelector(".google-btn");

const signupNameInput = document.getElementById("signupName");
const signupPhoneInput = document.getElementById("signupPhone");
const signupEmailInput = document.getElementById("signupEmail");
const signupPasswordInput = document.getElementById("signupPassword");
const signupButton = signupForm.querySelector("button[type='submit']");
const googleSignupBtn = signupForm.querySelector(".google-btn");

/* =========================
   HELPERS
========================= */
const updateButtonState = (form, button) => {
  form.checkValidity()
    ? button.classList.add("enabled")
    : button.classList.remove("enabled");
};

/* =========================
   INPUT LISTENERS
========================= */
[
  loginEmailInput,
  loginPasswordInput
].forEach(input =>
  input.addEventListener("input", () =>
    updateButtonState(loginForm, loginButton)
  )
);

[
  signupNameInput,
  signupPhoneInput,
  signupEmailInput,
  signupPasswordInput
].forEach(input =>
  input.addEventListener("input", () =>
    updateButtonState(signupForm, signupButton)
  )
);

updateButtonState(loginForm, loginButton);
updateButtonState(signupForm, signupButton);

/* =========================
   TAB SWITCHING
========================= */
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

/* =========================
   GOOGLE AUTH
========================= */
const handleGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        phone: user.phoneNumber || "",
        email: user.email,
        role: "user",
        createdAt: new Date()
      });
    }

    const role = userSnap.exists() ? userSnap.data().role : "user";

    if (role === "admin") {
      window.open("/sanity", "_blank");
      await auth.signOut();
      return;
    }

    const returnTo = sessionStorage.getItem("loginFrom") || "/index.html";
    sessionStorage.removeItem("loginFrom");
    window.location.href = returnTo;

  } catch (error) {
    console.error(error);
    alert("Google sign-in failed. Please try again.");
  }
};

googleLoginBtn.addEventListener("click", handleGoogleAuth);
googleSignupBtn.addEventListener("click", handleGoogleAuth);

/* =========================
   SIGN UP (EMAIL)
========================= */
signupForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!signupForm.reportValidity()) return;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      signupEmailInput.value.trim(),
      signupPasswordInput.value
    );

    await updateProfile(userCredential.user, {
      displayName: signupNameInput.value.trim()
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: signupNameInput.value.trim(),
      phone: signupPhoneInput.value.trim(),
      email: signupEmailInput.value.trim(),
      role: "user",
      createdAt: new Date()
    });

    await auth.signOut();
    signupForm.reset();
    updateButtonState(signupForm, signupButton);
    loginTab.click();

  } catch (error) {
    alert(error.message);
  }
});

/* =========================
   LOG IN (EMAIL)
========================= */
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!loginForm.reportValidity()) return;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmailInput.value.trim(),
      loginPasswordInput.value
    );

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role === "admin") {
      window.open("/sanity", "_blank");
      await auth.signOut();
    }

    const returnTo = sessionStorage.getItem("loginFrom") || "/index.html";
    sessionStorage.removeItem("loginFrom");
    window.location.href = returnTo;

  } catch {
    alert("Invalid email or password");
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
forgotPasswordLink.addEventListener("click", e => {
  e.preventDefault();
  window.matchMedia("(min-width: 769px)").matches
    ? window.open("/forgot-password.html", "_blank")
    : window.location.replace("/forgot-password.html");
});
