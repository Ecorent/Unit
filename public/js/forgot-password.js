import { auth } from "./firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const resetForm = document.getElementById("resetForm");
const resetEmailInput = document.getElementById("resetEmail");
const resetButton = resetForm.querySelector("button[type='submit']");

const updateButtonState = () => {
  resetButton.classList.toggle("enabled", resetForm.checkValidity());
};

resetEmailInput.addEventListener("input", updateButtonState);
updateButtonState();

/* FORCE BACK TO LOGIN */
window.addEventListener("popstate", () => {
  window.location.replace("/login.html");
});

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!resetForm.reportValidity()) return;

  try {
    await sendPasswordResetEmail(auth, resetEmailInput.value.trim());

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
