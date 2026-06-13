import { t } from "/js/i18n.js";

let currentLang = localStorage.getItem("lang") || "en";

const form = document.getElementById("maintenanceForm");
const feedback = document.getElementById("formFeedback");
const urgencyInput = document.getElementById("urgencyRating");
const urgencyOutput = document.getElementById("urgencyOutput");
const urgencyPrefix = document.getElementById("urgencyPrefix");

// Update dynamic severity layout label items
function updateUrgencyUI() {
  if (urgencyPrefix) {
    urgencyPrefix.textContent = t("maint_urgency_prefix") + " ";
  }
}

// Keep UI counter aligned dynamically with user interactions
urgencyInput.addEventListener("input", (e) => {
  urgencyOutput.textContent = e.target.value;
});

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // 1. Reset any existing global message states
  feedback.className = "form-feedback hidden";
  feedback.textContent = "";

  // 2. CHECK VALIDITY & ACCUSE INVALID FIELDS INDIVIDUALLY
  if (!form.checkValidity()) {
    form.reportValidity(); 
    return;
  }

  // Helper variables to prevent errors when elements aren't chosen
  const permissionSelection = document.querySelector('input[name="permissionEnter"]:checked');
  const waterSelection = document.querySelector('input[name="waterIssue"]:checked');
  const petsSelection = document.querySelector('input[name="petsPresent"]:checked');

  // 3. Build Form Object Payload
  const formData = {
    tenantName: document.getElementById("tenantName").value.trim(),
    tenantPhone: document.getElementById("tenantPhone").value.trim(),
    tenantEmail: document.getElementById("tenantEmail").value.trim(),
    propertyAddress: document.getElementById("propertyAddress").value.trim(),
    unitNumber: document.getElementById("unitNumber").value.trim(),
    issueDescription: document.getElementById("issueDescription").value.trim(),
    startDate: document.getElementById("startDate").value,
    permissionToEnter: permissionSelection ? permissionSelection.value : "",
    bestTime: document.getElementById("bestTime").value,
    waterIssue: waterSelection ? waterSelection.value : "",
    petsPresent: petsSelection ? petsSelection.value : "",
    urgencyRating: urgencyInput.value,
    acknowledged: document.getElementById("acknowledgment").checked
  };

  try {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;

    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    submitBtn.disabled = false;

    if (!response.ok || result.error) {
      throw new Error(result.error || "Failed to send");
    }

    showFeedback(t("contact_success"), "success");
    form.reset();
    urgencyInput.value = "5";
    urgencyOutput.textContent = "5"; 

  } catch (error) {
    document.getElementById("submitBtn").disabled = false;
    showFeedback(t("reset_error"), "error");
  }
});

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `form-feedback ${type}`;
}

window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  updateUrgencyUI();
});

window.addEventListener("pageshow", (event) => {
  currentLang = localStorage.getItem("lang") || "en";
  updateUrgencyUI();
});

// Setup dynamic texts immediately upon load
document.addEventListener("DOMContentLoaded", () => {
  updateUrgencyUI();
});
