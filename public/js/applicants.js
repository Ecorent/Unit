import { auth, db } from "./firebase.js";
import { t } from "/js/i18n.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const dashboard = document.getElementById("applicantsDashboard");
const accessPanel = document.getElementById("accessPanel");
const accessMessage = document.getElementById("accessMessage");
const applicantsList = document.getElementById("applicantsList");
const listStatus = document.getElementById("listStatus");
const rankingFilter = document.getElementById("rankingFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const newCount = document.getElementById("newCount");
const conversionRate = document.getElementById("conversionRate");
const monthCount = document.getElementById("monthCount");

let applications = [];
let unsubscribeApplications = null;

document.title = t("applicants_page_title");

onAuthStateChanged(auth, async user => {
  if (unsubscribeApplications) {
    unsubscribeApplications();
    unsubscribeApplications = null;
  }

  if (!user) {
    showAccess(t("applicants_login"));
    return;
  }

  const role = await getRole(user.uid);
  if (role !== "admin") {
    showAccess(t("applicants_denied"));
    return;
  }

  accessPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  subscribeToApplications();
});

[rankingFilter, statusFilter, searchInput].forEach(control => {
  control.addEventListener("input", renderApplicants);
});

applicantsList.addEventListener("click", event => {
  const toggle = event.target.closest(".details-toggle");
  if (!toggle) return;

  const row = toggle.closest(".applicant-row");
  const isOpen = row.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

applicantsList.addEventListener("change", async event => {
  const select = event.target.closest(".status-select");
  if (!select) return;

  select.disabled = true;

  try {
    await updateDoc(doc(db, "applications", select.dataset.id), {
      status: select.value,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to update application status:", error);
    alert("Could not update the applicant status. Please try again.");
    renderApplicants();
  } finally {
    select.disabled = false;
  }
});

window.addEventListener("languageChanged", () => {
  document.title = t("applicants_page_title");
  renderApplicants();
});

async function getRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : "user";
  } catch (error) {
    console.error("Failed to load user role:", error);
    return "user";
  }
}

function subscribeToApplications() {
  listStatus.textContent = t("applicants_loading");
  listStatus.classList.remove("hidden");

  const applicationsQuery = query(
    collection(db, "applications"),
    orderBy("submittedAt", "desc")
  );

  unsubscribeApplications = onSnapshot(
    applicationsQuery,
    snapshot => {
      applications = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      renderApplicants();
    },
    error => {
      console.error("Failed to load applications:", error);
      listStatus.textContent = "Applicants could not be loaded. Check Firestore permissions for the applications collection.";
      listStatus.classList.remove("hidden");
    }
  );
}

function showAccess(message) {
  applications = [];
  dashboard.classList.add("hidden");
  accessPanel.classList.remove("hidden");
  accessMessage.textContent = message;
}

function renderApplicants() {
  updateSummary();

  const filteredApplications = getFilteredApplications();

  if (!filteredApplications.length) {
    applicantsList.innerHTML = "";
    listStatus.textContent = t("applicants_empty");
    listStatus.classList.remove("hidden");
    return;
  }

  listStatus.classList.add("hidden");
  applicantsList.innerHTML = filteredApplications.map(renderApplicantRow).join("");
}

function getFilteredApplications() {
  const ranking = rankingFilter.value;
  const status = statusFilter.value;
  const search = searchInput.value.trim().toLowerCase();

  return applications.filter(application => {
    const matchesRanking = ranking === "all" || application.rankingBand === ranking;
    const matchesStatus = status === "all" || normalizeStatus(application.status) === status;
    const searchText = buildSearchText(application);
    const matchesSearch = !search || searchText.includes(search);

    return matchesRanking && matchesStatus && matchesSearch;
  });
}

function updateSummary() {
  totalCount.textContent = applications.length;
  newCount.textContent = countApplicationsByStatus("New");
  conversionRate.textContent = calculateConversionRate();
  monthCount.textContent = countApplicationsThisMonth();
}

function countApplicationsByStatus(status) {
  return applications.filter(application => normalizeStatus(application.status) === status).length;
}

function calculateConversionRate() {
  const approved = countApplicationsByStatus("Approved");
  const denied = countApplicationsByStatus("Denied");
  const decided = approved + denied;
  return decided ? `${Math.round((approved / decided) * 100)}%` : "0%";
}

function countApplicationsThisMonth() {
  const now = new Date();

  return applications.filter(application => {
    const submittedAt = getSubmittedDate(application);
    return submittedAt
      && submittedAt.getFullYear() === now.getFullYear()
      && submittedAt.getMonth() === now.getMonth();
  }).length;
}

function renderApplicantRow(application) {
  const name = application.applicantName || application.fullName || "Unnamed applicant";
  const email = application.applicantEmail || application.email || "";
  const phone = application.applicantPhone || application.phone || "";
  const unit = application.unitName || t("applicants_no_unit");
  const score = Number.isFinite(Number(application.rankingScore)) ? Number(application.rankingScore) : 0;
  const band = application.rankingBand || "Review";
  const status = normalizeStatus(application.status);

  return `
    <article class="applicant-row" data-id="${escapeHtml(application.id)}">
      <div class="applicant-summary">
        <div class="applicant-main">
          <h2>${escapeHtml(name)}</h2>
          <p>${escapeHtml(unit)}</p>
        </div>

        <div class="meta-block">
          <strong>${escapeHtml(t("applicants_rank_label"))}</strong>
          <span class="rank-badge ${getRankClass(band)}">${score}/100 ${escapeHtml(band)}</span>
        </div>

        <div class="meta-block">
          <strong>${escapeHtml(t("applicants_status_label"))}</strong>
          ${renderStatusSelect(application.id, status)}
        </div>

        <button class="details-toggle" type="button" aria-expanded="false">
          <span>${escapeHtml(t("applicants_details_label"))}</span>
          <i class="fas fa-chevron-down" aria-hidden="true"></i>
        </button>
      </div>

      <div class="applicant-details">
        <div class="details-grid">
          ${renderDetail(t("applicants_contact_label"), [email, phone].filter(Boolean).join(" / ") || "N/A")}
          ${renderDetail("Preferred contact method", application.preferredContact)}
          ${application.preferredContact === "Other" ? renderDetail("Other contact method", application.preferredContactOther) : ""}
          ${renderDetail(t("applicants_unit_label"), unit)}
          ${renderDetail(t("applicants_submitted_label"), formatDate(application))}
          ${renderDetail("Desired move-in", application.moveInDate)}
          ${renderDetail("Monthly income", formatCurrency(application.monthlyIncome))}
          ${renderDetail("Occupants", application.occupantCount)}
          ${renderDetail("Current address", application.currentAddress, true)}
          ${renderDetail("Employment", [application.employer, application.jobTitle, application.employmentLength].filter(Boolean).join(" / "), true)}
          ${renderDetail("Housing notes", buildHousingNotes(application), true)}
          ${renderDetail("Background notes", application.backgroundNotes, true)}
          ${renderDetail("Ranking factors", formatRankingFactors(application.rankingFactors), true)}
        </div>
      </div>
    </article>
  `;
}

function renderStatusSelect(id, currentStatus) {
  const statuses = [
    ["New", t("applicants_status_new")],
    ["Reviewing", t("applicants_status_reviewing")],
    ["Approved", t("applicants_status_approved")],
    ["Denied", t("applicants_status_denied")]
  ];

  return `
    <select class="status-select" data-id="${escapeHtml(id)}" aria-label="${escapeHtml(t("applicants_status_label"))}">
      ${statuses.map(([value, label]) => `
        <option value="${escapeHtml(value)}"${value === currentStatus ? " selected" : ""}>${escapeHtml(label)}</option>
      `).join("")}
    </select>
  `;
}

function renderDetail(label, value, isWide = false) {
  return `
    <div class="detail-field${isWide ? " wide" : ""}">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(value || "N/A")}</span>
    </div>
  `;
}

function getRankClass(band) {
  if (band === "Strong") return "strong";
  if (band === "Review") return "review";
  if (band === "Needs careful review") return "careful";
  return "concern";
}

function normalizeStatus(status) {
  return ["New", "Reviewing", "Approved", "Denied"].includes(status) ? status : "New";
}

function formatDate(application) {
  const submittedAt = getSubmittedDate(application);

  if (!submittedAt || Number.isNaN(submittedAt.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(submittedAt);
}

function getSubmittedDate(application) {
  const submittedAt = application.submittedAt?.toDate?.() || (
    application.submittedAtClient ? new Date(application.submittedAtClient) : null
  );

  return submittedAt && !Number.isNaN(submittedAt.getTime()) ? submittedAt : null;
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value || "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function buildHousingNotes(application) {
  return [
    `Rent: ${formatCurrency(application.monthlyRent)}`,
    `Residency: ${application.residencyLength || "N/A"}`,
    `Leaving: ${application.leavingReason || "N/A"}`,
    `Evicted: ${application.evicted || "N/A"}`,
    `Broken lease: ${application.brokenLease || "N/A"}`
  ].join(" | ");
}

function formatRankingFactors(factors) {
  if (!Array.isArray(factors) || !factors.length) return "No scoring notes.";

  return factors.map(factor => {
    const points = factor.points ? `${factor.points} ` : "";
    return `${points}${factor.label || ""}`.trim();
  }).join(" | ");
}

function buildSearchText(application) {
  return (
    application.searchText ||
    [
      application.applicantName,
      application.fullName,
      application.applicantEmail,
      application.email,
      application.applicantPhone,
      application.phone,
      application.unitName,
      application.slug
    ].filter(Boolean).join(" ")
  ).toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
