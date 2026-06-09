const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");
const unitName = params.get("unit");

const form = document.getElementById("rentalApplication");
const selectedUnit = document.getElementById("selectedUnit");
const scoreValue = document.getElementById("scoreValue");
const scoreBand = document.getElementById("scoreBand");
const feedback = document.getElementById("applicationFeedback");
const printButton = document.getElementById("printApplication");

if (unitName) {
  selectedUnit.textContent = unitName;
}

if (slug) {
  fetch(`/api/unit?slug=${encodeURIComponent(slug)}`)
    .then(res => res.json())
    .then(({ result }) => {
      if (!result) return;
      selectedUnit.textContent = result.title?.en || unitName || "Selected apartment";
    })
    .catch(() => {
      selectedUnit.textContent = unitName || "Selected apartment";
    });
}

printButton.addEventListener("click", () => {
  window.print();
});

form.addEventListener("input", updateCompletionStatus);
form.addEventListener("change", updateCompletionStatus);

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    updateCompletionStatus();
    showFeedback("error", "Please complete every required field before reviewing the application.");
    return;
  }

  scoreValue.textContent = "100%";
  scoreBand.textContent = "Ready for review";
  showFeedback("success", "Application complete. All required questions have been answered and the application is ready for review.");
});

function updateCompletionStatus() {
  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  const completedFields = requiredFields.filter(isFieldComplete);
  const percent = requiredFields.length
    ? Math.round((completedFields.length / requiredFields.length) * 100)
    : 0;

  scoreValue.textContent = `${percent}%`;
  scoreBand.textContent = percent === 100
    ? "Ready for review"
    : "Application incomplete";
}

function isFieldComplete(field) {
  if (field.type === "checkbox") return field.checked;
  return field.value.trim() !== "";
}

function showFeedback(type, message) {
  feedback.className = `application-feedback ${type}`;
  feedback.textContent = message;
}

updateCompletionStatus();
