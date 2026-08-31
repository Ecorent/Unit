import { t } from "/js/i18n.js";

const params = new URLSearchParams(window.location.search);
const stay = {
  slug: params.get("slug") || "",
  unitName: params.get("unit") || "",
  checkIn: params.get("checkIn") || "",
  checkOut: params.get("checkOut") || "",
  estimatedTotal: params.get("estimatedTotal") || ""
};
const form = document.getElementById("availabilityRequestForm");
const feedback = document.getElementById("availabilityFeedback");
const submitButton = form.querySelector("button[type='submit']");
let currentLang = localStorage.getItem("lang") || "en";

renderStaySummary();
markRequiredFields();
syncPreferredContact();

form.addEventListener("input", syncPreferredContact);
form.addEventListener("change", syncPreferredContact);

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!stay.slug || !stay.checkIn || !stay.checkOut || !stay.estimatedTotal) {
    showFeedback("error", t("availability_missing_stay"));
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    showFeedback("error", t("application_error_required"));
    return;
  }

  submitButton.disabled = true;
  showFeedback("success", t("availability_sending"));

  const formData = new FormData(form);
  const payload = { ...stay };
  formData.forEach((value, key) => {
    payload[key] = typeof value === "string" ? value.trim() : value;
  });

  try {
    const response = await fetch("/api/availability-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || "Request failed");

    form.reset();
    syncPreferredContact();
    showFeedback("success", t("availability_success"));
  } catch (error) {
    console.error("Availability request failed:", error);
    showFeedback("error", t("availability_error"));
  } finally {
    submitButton.disabled = false;
  }
});

window.addEventListener("languageChanged", event => {
  currentLang = event.detail;
  renderStaySummary();
  document.title = t("availability_page_title");
});

function renderStaySummary() {
  document.getElementById("selectedUnit").textContent = stay.unitName || t("application_selected_apartment");
  document.getElementById("selectedCheckIn").textContent = formatDate(stay.checkIn);
  document.getElementById("selectedCheckOut").textContent = formatDate(stay.checkOut);
  document.getElementById("selectedTotal").textContent = formatCurrency(stay.estimatedTotal);
  document.title = t("availability_page_title");
}

function syncPreferredContact() {
  const method = form.elements.preferredContact.value;
  const details = form.elements.preferredContactOther;
  const isOther = method === "Other";
  details.readOnly = !isOther;
  details.required = isOther;
  details.setAttribute("aria-readonly", String(!isOther));

  if (isOther) {
    if (details.dataset.autoFilled === "true") details.value = "";
    delete details.dataset.autoFilled;
    details.classList.remove("is-auto-filled");
    return;
  }

  details.value = method === "Email"
    ? form.elements.email.value
    : method === "Text message"
      ? form.elements.phone.value
      : "";
  details.dataset.autoFilled = "true";
  details.classList.add("is-auto-filled");
}

function markRequiredFields() {
  form.querySelectorAll("[required]").forEach(field => {
    const label = field.closest("label");
    const labelText = label?.querySelector(".field-label");
    if (!labelText || labelText.querySelector(".required-marker")) return;
    const marker = document.createElement("span");
    marker.className = "required-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = " *";
    labelText.appendChild(marker);
  });
}

function showFeedback(type, message) {
  feedback.className = `application-feedback ${type}`;
  feedback.textContent = message;
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(
    currentLang === "es" ? "es-US" : "en-US",
    { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }
  );
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return amount.toLocaleString(currentLang === "es" ? "es-US" : "en-US", {
    style: "currency",
    currency: "USD"
  });
}
