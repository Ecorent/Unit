import { t } from "/js/i18n.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const unitName = params.get("unit");

const form = document.getElementById("rentalApplication");
const selectedUnit = document.getElementById("selectedUnit");
const scoreValue = document.getElementById("scoreValue");
const scoreBand = document.getElementById("scoreBand");
const feedback = document.getElementById("applicationFeedback");
const stepper = document.getElementById("applicationStepper");
const stepperToggle = document.getElementById("applicationStepperToggle");
const stepperButtons = Array.from(document.querySelectorAll(".application-stepper button[data-section-target]"));
let currentLang = localStorage.getItem("lang") || "en";
let selectedUnitTitle = null;

const conditionalFields = [
  {
    trigger: "evicted",
    inactiveValue: "No",
    fields: [{ name: "evictionExplanation", value: "N/A" }]
  },
  {
    trigger: "brokenLease",
    inactiveValue: "No",
    fields: [{ name: "brokenLeaseExplanation", value: "N/A" }]
  },
  {
    trigger: "bankruptcy",
    inactiveValue: "No",
    fields: [{ name: "bankruptcyExplanation", value: "N/A" }]
  },
  {
    trigger: "criminalConviction",
    inactiveValue: "No",
    fields: [{ name: "convictionExplanation", value: "N/A" }]
  },
  {
    trigger: "pets",
    inactiveValue: "No",
    fields: [
      { name: "petType", value: "N/A" },
      { name: "petBreed", value: "N/A" },
      { name: "petWeight", value: "N/A" },
      { name: "petCount", value: "0" }
    ]
  }
];

const draftKey = `ecorent:rentalApplication:${slug || unitName || "general"}`;

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

form.addEventListener("input", () => {
  saveDraft();
  updateCompletionStatus();
  updateStepper();
});

form.addEventListener("change", () => {
  applyConditionalFields();
  saveDraft();
  updateCompletionStatus();
  updateStepper();
});

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
    clearDraft();
    updateStepper();
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

function updateStepper() {
  const firstIncompleteSection = stepperButtons
    .map(button => document.getElementById(button.dataset.sectionTarget))
    .find(section => {
      if (!section) return false;
      const requiredFields = Array.from(section.querySelectorAll("[required]"));
      return requiredFields.some(field => !isFieldComplete(field));
    });

  stepperButtons.forEach(button => {
    const section = document.getElementById(button.dataset.sectionTarget);
    if (!section) return;

    const requiredFields = Array.from(section.querySelectorAll("[required]"));
    const isComplete = requiredFields.length > 0 && requiredFields.every(isFieldComplete);
    const number = button.dataset.stepNumber || button.querySelector("span")?.textContent || "";
    const indicator = button.querySelector("span");
    const isCurrent = section === firstIncompleteSection;

    button.classList.toggle("is-complete", isComplete);
    button.classList.toggle("is-current", isCurrent);
    button.setAttribute("aria-current", isCurrent ? "step" : "false");

    if (indicator) {
      indicator.textContent = isComplete ? "✓" : number;
    }
  });
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

function saveDraft() {
  try {
    localStorage.setItem(draftKey, JSON.stringify(collectDraftData()));
  } catch {
    // Draft saving is a convenience; form submission should still work if storage is unavailable.
  }
}

function restoreDraft() {
  try {
    const savedDraft = localStorage.getItem(draftKey);
    if (!savedDraft) return;

    const draft = JSON.parse(savedDraft);

    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements[name];
      if (!field) return;

      if (field.type === "checkbox") {
        field.checked = Boolean(value);
        return;
      }

      field.value = value;
    });
  } catch {
    localStorage.removeItem(draftKey);
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(draftKey);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function collectDraftData() {
  const data = {};
  const fields = Array.from(form.elements).filter(field => field.name);

  fields.forEach(field => {
    data[field.name] = field.type === "checkbox"
      ? field.checked
      : field.value;
  });

  return data;
}

function applyConditionalFields() {
  conditionalFields.forEach(group => {
    const trigger = form.elements[group.trigger];
    if (!trigger) return;

    const shouldAutofill = trigger.value === group.inactiveValue;

    group.fields.forEach(({ name, value }) => {
      const field = form.elements[name];
      if (!field) return;

      if (shouldAutofill) {
        field.value = value;
        field.readOnly = true;
        field.dataset.autoFilled = "true";
        field.classList.add("is-auto-filled");
        field.setAttribute("aria-readonly", "true");
        return;
      }

      field.readOnly = false;
      field.classList.remove("is-auto-filled");
      field.removeAttribute("aria-readonly");

      if (field.dataset.autoFilled === "true") {
        field.value = "";
      }

      delete field.dataset.autoFilled;
    });
  });
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

function updateStepperToggleLabel() {
  if (!stepper || !stepperToggle) return;

  const isCollapsed = stepper.classList.contains("is-collapsed");
  stepperToggle.setAttribute("aria-expanded", String(!isCollapsed));
  stepperToggle.setAttribute(
    "aria-label",
    t(isCollapsed ? "application_menu_expand" : "application_menu_collapse")
  );
  stepper.dataset.menuLabel = t("application_menu_label");
}

function scrollToSection(section) {
  const stickyOffset = (stepper?.offsetHeight || 0) + 56;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: Math.max(sectionTop - stickyOffset, 0),
    behavior: "smooth"
  });
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

stepperButtons.forEach(button => {
  const indicator = button.querySelector("span");
  button.dataset.stepNumber = indicator?.textContent || "";

  button.addEventListener("click", () => {
    const section = document.getElementById(button.dataset.sectionTarget);
    if (!section) return;

    scrollToSection(section);

    const firstIncompleteField = Array.from(section.querySelectorAll("[required]"))
      .find(field => !isFieldComplete(field));

    const fieldToFocus = firstIncompleteField || section.querySelector("input, select, textarea");
    fieldToFocus?.focus({ preventScroll: true });
  });
});

stepperToggle?.addEventListener("click", () => {
  stepper?.classList.toggle("is-collapsed");
  updateStepperToggleLabel();
});

window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  updatePageTitle();
  updateSelectedUnit();
  updateStepperToggleLabel();
  updateCompletionStatus();
  markRequiredFields();
  updateStepper();
});

window.addEventListener("pageshow", () => {
  currentLang = localStorage.getItem("lang") || "en";
  updatePageTitle();
  updateSelectedUnit();
  updateStepperToggleLabel();
  updateCompletionStatus();
  markRequiredFields();
  updateStepper();
});

updatePageTitle();
updateStepperToggleLabel();
markRequiredFields();
restoreDraft();
applyConditionalFields();
updateSelectedUnit();
updateCompletionStatus();
updateStepper();
