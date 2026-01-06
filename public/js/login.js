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

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordLink = document.getElementById("forgotPassword");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginButton = loginForm.querySelector("button");

const signupNameInput = document.getElementById("signupName");
const signupPhoneInput = document.getElementById("signupPhone");
const signupEmailInput = document.getElementById("signupEmail");
const signupPasswordInput = document.getElementById("signupPassword");
const signupButton = signupForm.querySelector("button");

const updateButtonState = (form, button) => {
  if (form.checkValidity()) {
    button.classList.add("enabled");
  } else {
    button.classList.remove("enabled");
  }
};

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

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!signupForm.reportValidity()) return;

  const name = signupNameInput.value.trim();
  const phone = signupPhoneInput.value.trim();
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      name,
      phone,
      email,
      role: "user",
      createdAt: new Date()
    });

    await auth.signOut();

    signupForm.reset();
    updateButtonState(signupForm, signupButton);
    loginTab.click();

  } catch (error) {
    alert(error.message);
    signupForm.reset();
    updateButtonState(signupForm, signupButton);
    signupNameInput.focus();
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!loginForm.reportValidity()) return;

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role === "admin") {
      window.open("/sanity", "_blank");
      await auth.signOut();
    }

    window.location.href = "/index.html";

  } catch {
    alert("Invalid email or password");
    loginForm.reset();
    updateButtonState(loginForm, loginButton);
    loginEmailInput.focus();
  }
});

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/forgot-password.html";
});
