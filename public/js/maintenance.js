import { t } from "/js/i18n.js";

let currentLang = localStorage.getItem("lang") || "en";

const form = document.getElementById("maintenanceForm");
const feedback = document.getElementById("formFeedback");
const urgencyInput = document.getElementById("urgencyRating");
const urgencyOutput = document.getElementById("urgencyOutput");
const urgencyPrefix = document.getElementById("urgencyPrefix");
const photoInput = document.getElementById("issuePhotos");
const photoFileList = document.getElementById("photoFileList");
const maxPhotos = 3;
const maxPhotoBytes = 2 * 1024 * 1024;
let selectedPhotos = [];

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

photoInput.addEventListener("change", () => {
  const files = Array.from(photoInput.files || []);
  const acceptedFiles = [];
  let errorMessage = "";

  files.slice(0, maxPhotos).forEach(file => {
    if (!file.type.startsWith("image/")) {
      errorMessage = t("maint_photo_type_error");
      return;
    }

    if (file.size > maxPhotoBytes) {
      errorMessage = t("maint_photo_size_error");
      return;
    }

    acceptedFiles.push(file);
  });

  if (files.length > maxPhotos) {
    errorMessage = t("maint_photo_count_error");
  }

  selectedPhotos = acceptedFiles;
  renderPhotoFileList(errorMessage);
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
    acknowledged: document.getElementById("acknowledgment").checked,
    issuePhotos: await serializePhotos(selectedPhotos)
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
    selectedPhotos = [];
    renderPhotoFileList();
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

function renderPhotoFileList(errorMessage = "") {
  photoFileList.innerHTML = "";

  selectedPhotos.forEach(file => {
    const item = document.createElement("div");
    item.className = "photo-file-item";

    const name = document.createElement("span");
    name.textContent = file.name;

    const size = document.createElement("small");
    size.textContent = formatFileSize(file.size);

    item.append(name, size);
    photoFileList.appendChild(item);
  });

  if (errorMessage) {
    const error = document.createElement("div");
    error.className = "photo-upload-error";
    error.textContent = errorMessage;
    photoFileList.appendChild(error);
  }
}

function serializePhotos(files) {
  return Promise.all(files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      resolve({
        filename: file.name,
        contentType: file.type,
        content: result.includes(",") ? result.split(",")[1] : result
      });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  })));
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
