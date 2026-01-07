import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const signupNameInput = document.getElementById("signupName");
const signupPhoneInput = document.getElementById("signupPhone");
const signupEmailInput = document.getElementById("signupEmail");
const signupPasswordInput = document.getElementById("signupPassword");
const signupButton = signupForm.querySelector("button[type='submit']");

/* =========================
   HELPERS
========================= */
const updateButtonState = (form, button) => {
  button.classList.toggle("enabled", form.checkValidity());
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
   SIGN UP
========================= */
signupForm.addEventListener("submit", async (e) => {
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
    loginTab.click();

  } catch (error) {
    alert(error.message);
  }
});

/* =========================
   LOG IN
========================= */
loginForm.addEventListener("submit", async (e) => {
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

    window.location.href = "/index.html";

  } catch {
    alert("Invalid email or password");
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  const isDesktop = window.matchMedia("(min-width: 769px)").matches;

  if (isDesktop) {
    window.open("/forgot-password.html", "_blank");
  } else {
    window.location.replace("/forgot-password.html");
  }
});
