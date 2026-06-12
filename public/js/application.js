import { t } from "/js/i18n.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const unitName = params.get("unit");

const form = document.getElementById("rentalApplication");
const selectedUnit = document.getElementById("selectedUnit");
const scoreValue = document.getElementById("scoreValue");
const scoreBand = document.getElementById("scoreBand");
const feedback = document.getElementById("applicationFeedback");
let currentLang = localStorage.getItem("lang") || "en";
let selectedUnitTitle = null;

if (unitName) {
  selectedUnit.textContent = unitName;
  selectedUnit.removeAttribute("data-i18n");
}

if (slug) {
  fetch(`/api/unit?slug=${encodeURIComponent(slug)}`)
    .then(res => res.json())
    .then(({ result }) => {
      if (!result) return;
      selectedUnitTitle = result.title || null;
      updateSelectedUnit();
    })
    .catch(() => {
      updateSelectedUnit();
    });
}

form.addEventListener("input", updateCompletionStatus);
form.addEventListener("change", updateCompletionStatus);

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    updateCompletionStatus();
    showFeedback("error", t("application_error_required"));
    return;
  }

  const submitButton = form.querySelector(".submit-button");
  submitButton.disabled = true;
  showFeedback("success", t("application_sending"));

  try {
    const response = await fetch("/api/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildApplicationPayload())
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || "Application failed to send");
    }

    scoreValue.textContent = "100%";
    scoreBand.textContent = t("application_ready");
    showFeedback("success", t("application_success"));
  } catch {
    showFeedback("error", t("application_submit_error"));
  } finally {
    submitButton.disabled = false;
  }
});

function updateCompletionStatus() {
  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  const completedFields = requiredFields.filter(isFieldComplete);
  const percent = requiredFields.length
    ? Math.round((completedFields.length / requiredFields.length) * 100)
    : 0;

  scoreValue.textContent = `${percent}%`;
  scoreBand.textContent = percent === 100
    ? t("application_ready")
    : t("application_incomplete");
}

function isFieldComplete(field) {
  if (field.type === "checkbox") return field.checked;
  return field.value.trim() !== "";
}

function showFeedback(type, message) {
  feedback.className = `application-feedback ${type}`;
  feedback.textContent = message;
}

function buildApplicationPayload() {
  const formData = new FormData(form);
  const payload = {
    slug,
    unitName: selectedUnit.textContent.trim()
  };

  formData.forEach((value, key) => {
    payload[key] = typeof value === "string" ? value.trim() : value;
  });

  payload.screeningAuthorization = form.elements.screeningAuthorization.checked;
  payload.acknowledgment = form.elements.acknowledgment.checked;

  return payload;
}

function updateSelectedUnit() {
  if (selectedUnitTitle) {
    selectedUnit.textContent = selectedUnitTitle[currentLang] || selectedUnitTitle.en || unitName || t("application_selected_apartment");
    selectedUnit.removeAttribute("data-i18n");
    return;
  }

  if (unitName) {
    selectedUnit.textContent = unitName;
    selectedUnit.removeAttribute("data-i18n");
    return;
  }

  selectedUnit.textContent = t("application_selected_apartment");
}

function updatePageTitle() {
  document.title = t("application_page_title");
}

function markRequiredFields() {
  const requiredFields = Array.from(form.querySelectorAll("[required]"));

  requiredFields.forEach(field => {
    const label = field.closest("label");
    if (!label || label.querySelector(".required-marker")) return;

    const marker = document.createElement("span");
    marker.className = "required-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "*";

    if (label.classList.contains("checkbox-card")) {
      const textSpan = label.querySelector("span");
      if (!textSpan) return;
      textSpan.append(" ", marker);
      return;
    }

    const existingLabelText = label.querySelector(".field-label");
    if (existingLabelText) {
      existingLabelText.append(" ", marker);
      return;
    }

    const labelText = document.createElement("span");
    labelText.className = "field-label";

    const textNode = Array.from(label.childNodes).find(node =>
      node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );

    if (!textNode) return;

    labelText.textContent = textNode.textContent.trim();
    labelText.append(" ", marker);
    label.replaceChild(labelText, textNode);
  });
}

window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  updatePageTitle();
  updateSelectedUnit();
  updateCompletionStatus();
  markRequiredFields();
});

window.addEventListener("pageshow", () => {
  currentLang = localStorage.getItem("lang") || "en";
  updatePageTitle();
  updateSelectedUnit();
  updateCompletionStatus();
  markRequiredFields();
});

updatePageTitle();
markRequiredFields();
updateSelectedUnit();
updateCompletionStatus();
