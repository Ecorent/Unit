import { auth } from "./firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ---------- ELEMENTS ---------- */
const resetForm = document.getElementById("resetForm");
const resetEmailInput = document.getElementById("resetEmail");
const resetButton = resetForm.querySelector("button[type='submit']");
const backToLoginLink = document.querySelector(".forgot-password");

/* ---------- BUTTON STATE ---------- */
const updateButtonState = () => {
  resetButton.classList.toggle(
    "enabled",
    resetForm.checkValidity()
  );
};

resetEmailInput.addEventListener("input", updateButtonState);
updateButtonState();

/* ---------- SUBMIT RESET ---------- */
resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!resetForm.reportValidity()) return;

  const email = resetEmailInput.value.trim();

  try {
    await sendPasswordResetEmail(auth, email);

    alert(
      "If an account with that email exists, a password reset link has been sent."
    );

    resetForm.reset();
    updateButtonState();

    window.location.replace("/login.html");

  } catch (error) {
    alert(error.message);
    resetEmailInput.focus();
  }
});

/* ---------- BACK TO LOGIN ---------- */
backToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();

  const isDesktop = window.matchMedia("(min-width: 769px)").matches;

  if (isDesktop) {
    window.close();
  } else {
    window.location.replace("/login.html");
  }
});