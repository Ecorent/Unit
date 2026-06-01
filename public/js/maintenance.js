import { t } from "/js/i18n.js";

// Global language state tracking local behavior
let currentLang = localStorage.getItem("lang") || "en";

const form = document.getElementById("maintenanceForm");
const feedback = document.getElementById("formFeedback");

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Clear any existing global states
  feedback.className = "form-feedback hidden";
  feedback.textContent = "";

  // HTML Validation fallback check
  if (!form.checkValidity()) {
    showFeedback(t("reset_error"), "error");
    return;
  }

  // Build Form Object Payload
  const formData = {
    tenantName: document.getElementById("tenantName").value.trim(),
    tenantPhone: document.getElementById("tenantPhone").value.trim(),
    tenantEmail: document.getElementById("tenantEmail").value.trim(),
    propertyAddress: document.getElementById("propertyAddress").value.trim(),
    unitNumber: document.getElementById("unitNumber").value.trim(),
    issueDescription: document.getElementById("issueDescription").value.trim(),
    startDate: document.getElementById("startDate").value,
    permissionToEnter: document.querySelector('input[name="permissionEnter"]:checked').value,
    bestTime: document.getElementById("bestTime").value,
    waterIssue: document.querySelector('input[name="waterIssue"]:checked').value,
    petsPresent: document.querySelector('input[name="petsPresent"]:checked').value,
    acknowledged: document.getElementById("acknowledgment").checked
  };

  try {
    /* 🚀 CONNECT TO YOUR BACKEND API SYSTEM HERE
       Example pipeline wiring:
       
       const response = await fetch("https://your-api-endpoint.com/maintenance", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData)
       });
       if (!response.ok) throw new Error();
    */

    // Simulating database transaction delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Show interactive completion block
    showFeedback(t("contact_success"), "success");
    form.reset();

  } catch (error) {
    showFeedback(t("reset_error"), "error");
  }
});

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `form-feedback ${type}`;
}

// 🌍 Language hook configurations mirroring home page pipeline logic
window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
});

window.addEventListener("pageshow", (event) => {
  currentLang = localStorage.getItem("lang") || "en";
});