// public/js/forgot-password.js
import { auth } from "./firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const resetForm = document.getElementById("resetForm");
const resetEmailInput = document.getElementById("resetEmail");

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = resetEmailInput.value.trim();

  try {
    await sendPasswordResetEmail(auth, email);

    alert(
      "If an account with that email exists, a password reset link has been sent."
    );

    // Clear input
    resetEmailInput.value = "";

    // Redirect back to login page
    window.location.href = "/login.html";

  } catch (error) {
    alert(error.message);
    resetEmailInput.focus();
  }
});
