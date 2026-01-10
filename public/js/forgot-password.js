import { auth } from "./firebase.js";
import { initI18n } from "/js/i18n.js";
import { t } from "./i18n.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ---------- INIT I18N (ONCE) ---------- */
initI18n();

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
resetForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!resetForm.reportValidity()) return;

  const email = resetEmailInput.value.trim();

  try {
    await sendPasswordResetEmail(auth, email);

    alert(t("reset_email_sent"));

    resetForm.reset();
    updateButtonState();

    const isDesktop = window.matchMedia("(min-width: 769px)").matches;

    if (isDesktop) {
      window.close();
    } else {
      window.location.replace("/login.html");
    }

  } catch (error) {
    alert(t("reset_error"));
    resetEmailInput.focus();
  }
});

/* ---------- BACK TO LOGIN ---------- */
backToLoginLink.addEventListener("click", e => {
  e.preventDefault();

  const isDesktop = window.matchMedia("(min-width: 769px)").matches;

  if (isDesktop) {
    window.close();
  } else {
    window.location.replace("/login.html");
  }
});
