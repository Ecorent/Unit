import { t, tPlural } from "/js/i18n.js";
import {
  calculateNightlyQuote,
  formatListingPrice,
  getSeasonBounds,
  getSeasonalRates,
  isNightly
} from "/js/pricing.js";

// 🔑 SANITY CONFIG
// 🌍 CURRENT LANGUAGE
let currentLang = localStorage.getItem("lang") || "en";

// 📦 CACHE
let unitCache = null;
let formMessageState = null; // "success" | "error" | null
let nightlySelection = { checkIn: "", checkOut: "" };

// 📩 CONTACT FORM MESSAGE STATE

// 🔎 GET SLUG
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.body.innerHTML = `<h1>${t("unit_not_found")}</h1>`;
  throw new Error("Missing slug");
}

// 🧠 QUERY (BOTH LANGUAGES)
// 🔄 FETCH ONCE
fetch(`/api/unit?slug=${encodeURIComponent(slug)}`)
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.code || "UNIT_REQUEST_FAILED");
    return data;
  })
  .then(({ result }) => {
    if (!result) {
      document.body.innerHTML = `<h1>${t("unit_not_found")}</h1>`;
      return;
    }

    unitCache = result;
    renderUnit(currentLang);
  })
  .catch(error => {
    console.error("Unable to load unit:", error);
    renderUnitLoadError();
  });

// 💰 PRICE FORMATTER
function sanityImageUrl(url, width, quality = 82) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}auto=format&w=${width}&q=${quality}&fit=max`;
}

// 💵 DEPOSIT FORMATTER
function formatDeposit(amount) {
  if (amount == null) {
    return t("security_deposit_not_required");
  }

  const formatted = `$${Number(amount).toLocaleString()}`;
  return t("security_deposit_required").replace("{{amount}}", formatted);
}

// 📅 AVAILABILITY FORMATTER
function formatAvailability(availability, lang) {
  if (!availability || availability.availableNow) {
    return t("available_now");
  }

  if (availability.availableFrom) {
    const date = new Date(availability.availableFrom).toLocaleDateString(
      lang === "es" ? "es-ES" : "en-US",
      { month: "long", day: "numeric" }
    );

    return `${t("available_from")} ${date}`;
  }

  return t("available_now");
}

// 🧱 RENDER UNIT
function renderUnit(lang) {
  if (!unitCache) return;

  const unit = unitCache;

  document.getElementById("pageTitle").textContent = unit.title[lang];
  document.getElementById("unitTitle").textContent = unit.title[lang];
  document.getElementById("unitPrice").textContent = formatListingPrice(unit, t);

  document.getElementById("unitDetails").innerHTML = `
    <li><i class="fas fa-bed"></i>${unit.bedrooms} ${tPlural("bedroom", unit.bedrooms)}</li>
    <li><i class="fas fa-bath"></i>${unit.bathrooms} ${tPlural("bathroom", unit.bathrooms)}</li>
    <li><i class="fas fa-ruler-combined"></i>${unit.sqft} ${t("sqft_unit")}</li>
    <li>
      <i class="fas ${unit.petFriendly ? "fa-dog" : "fa-ban"}"></i>
      ${unit.petFriendly ? t("pet_friendly") : t("no_pets")}
    </li>
    <li><i class="fas fa-tint"></i>${unit.utilitiesIncluded[lang]}</li>
    <li><i class="fas fa-soap"></i>${unit.washerDryer[lang]}</li>
    <li><i class="fas fa-box-archive"></i>${unit.parking[lang]}</li>
    <li><i class="fas fa-star"></i>${unit.locationHighlights[lang]}</li>
    <li><i class="fas fa-money-bill-wave"></i>${formatDeposit(unit.deposit)}</li>
    <li><i class="fas fa-calendar-check"></i>${formatAvailability(unit.availability, lang)}</li>
  `;

  document.getElementById("mapFrame").src =
    `https://maps.google.com/maps?q=${encodeURIComponent(unit.address)}&output=embed&hl=${lang}`;

  if (isNightly(unit)) {
    renderNightlyPricingPanel(unit, lang);
  } else {
    renderMonthlyApplicationPanel(unit, lang);
    updateApplicationLinks(unit, lang);
  }

  if (!document.querySelector(".carousel-track")) {
    initCarousel(unit.images || []);
  } else {
    updateCarouselAltText(unit, lang);
  }

  syncLeftColumnHeight();

  // 🔁 re-render contact message on language change
}

function syncLeftColumnHeight() {
  const leftColumn = document.querySelector(".left-column");
  const details = document.querySelector(".details");

  if (!leftColumn || !details) return;

  if (window.matchMedia("(max-width: 768px)").matches) {
    leftColumn.style.height = "";
    return;
  }

  requestAnimationFrame(() => {
    leftColumn.style.height = `${details.offsetHeight}px`;
  });
}

window.addEventListener("resize", syncLeftColumnHeight);

// 🌍 LANGUAGE CHANGE LISTENER
window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  renderUnit(currentLang);
});

// 🎠 CAROUSEL (UNCHANGED)
function initCarousel(images) {
  const carousel = document.getElementById("carousel");
  if (!images.length) return;

  const blur = document.createElement("div");
  blur.className = "blur-bg";
  carousel.appendChild(blur);

  const track = document.createElement("div");
  track.className = "carousel-track";
  carousel.appendChild(track);

  images.forEach((img, index) => {
    const image = document.createElement("img");
    image.src = sanityImageUrl(img.asset.url, 1200);
    image.dataset.previewSrc = sanityImageUrl(img.asset.url, 100, 45);
    image.alt = unitCache?.title?.[currentLang] || unitCache?.title?.en || "";
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    track.appendChild(image);
  });

  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.innerHTML = `
    <button id="prev">&#10094;</button>
    <button id="next">&#10095;</button>
  `;
  carousel.appendChild(controls);

  const imgs = track.querySelectorAll("img");
  let index = 0;

  blur.style.backgroundImage = `url(${imgs[0].dataset.previewSrc || imgs[0].src})`;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    blur.style.backgroundImage = `url(${imgs[index].dataset.previewSrc || imgs[index].src})`;
  }

  document.getElementById("prev").onclick = () => {
    index = (index - 1 + imgs.length) % imgs.length;
    update();
  };

  document.getElementById("next").onclick = () => {
    index = (index + 1) % imgs.length;
    update();
  };
}

function updateCarouselAltText(unit, lang) {
  const alt = unit.title?.[lang] || unit.title?.en || "";
  document.querySelectorAll(".carousel-track img").forEach(img => {
    img.alt = alt;
  });
}

// 📩 CONTACT FORM
if (document.getElementById("contactForm")) {
const form = document.getElementById("contactForm");
const sendButton = form.querySelector("button");
const messageEl = document.getElementById("form-message");

function updateSendButtonState() {
  sendButton.classList.toggle("is-ready", form.checkValidity());
}

form.addEventListener("input", updateSendButtonState);

// 🔁 Render translated form message
function renderFormMessage() {
  if (!formMessageState) {
    messageEl.textContent = "";
    return;
  }

  const key =
    formMessageState === "success"
      ? "contact_success"
      : "reset_error";

  messageEl.textContent = t(key);
  messageEl.style.color =
    formMessageState === "success" ? "green" : "red";
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: e.target.name.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    message: e.target.message.value,
    unitTitle: e.target.unitTitle.value
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    formMessageState = "success";
    renderFormMessage();

    e.target.reset();
    updateSendButtonState();
  } catch {
    formMessageState = "error";
    renderFormMessage();
  }
});
}

function updateApplicationLinks(unit, lang) {
  const query = new URLSearchParams({
    slug,
    unit: unit.title[lang] || unit.title.en || ""
  });

  const href = `application.html?${query.toString()}`;
  const applyTopLink = document.getElementById("applyTopLink");

  applyTopLink.href = href;
  applyTopLink.classList.remove("is-disabled");
  applyTopLink.removeAttribute("aria-disabled");
  applyTopLink.removeAttribute("aria-busy");
  document.getElementById("applyPanelLink").href = href;
}

function renderMonthlyApplicationPanel() {
  const panel = document.getElementById("unitActionPanel");
  panel.className = "apply-panel-inline";
  panel.removeAttribute("aria-busy");
  panel.innerHTML = `
    <p class="unit-kicker">${t("unit_next_step")}</p>
    <h2 class="section-title">${t("unit_start_application")}</h2>
    <p class="apply-copy">${t("unit_apply_copy")}</p>
    <div class="application-notes" aria-label="${t("unit_application_details")}">
      <div><i class="fas fa-user-group"></i><span>${t("unit_note_occupants")}</span></div>
      <div><i class="fas fa-list-check"></i><span>${t("unit_note_documents")}</span></div>
      <div><i class="fas fa-receipt"></i><span>${t("unit_note_reservation")}</span></div>
      <div><i class="fas fa-file-signature"></i><span>${t("unit_note_follow_up")}</span></div>
    </div>
    <a class="apply-button apply-button-large is-disabled" id="applyTopLink" aria-disabled="true" aria-busy="true">
      <span>${t("unit_apply_button")}</span>
      <i class="fas fa-arrow-right"></i>
    </a>
    <a class="hidden-apply-link" id="applyPanelLink" aria-hidden="true" tabindex="-1"></a>
  `;
}

function renderNightlyPricingPanel(unit, lang) {
  const panel = document.getElementById("unitActionPanel");
  const bounds = getSeasonBounds(unit.seasonalRates);
  const seasonalRates = getSeasonalRates(unit.seasonalRates);
  const today = new Date().toISOString().slice(0, 10);
  const firstAvailable = bounds?.firstDate && bounds.firstDate > today ? bounds.firstDate : today;
  const locale = lang === "es" ? "es-US" : "en-US";
  const currency = value => Number(value).toLocaleString(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
  const rateCurrency = value => Number(value).toLocaleString(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  const formatSeasonDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
  const seasonalRatesMarkup = seasonalRates.length ? `
    <details class="seasonal-rates-toggle">
      <summary>
        <span>${t("view_seasonal_rates")}</span>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
      </summary>
      <div class="seasonal-rates-list">
        ${seasonalRates.map(rate => `
          <div class="seasonal-rate-row">
            <span>${formatSeasonDate(rate.startDate)} – ${formatSeasonDate(rate.endDate)}</span>
            <strong>${rateCurrency(rate.nightlyRate)}/${t("night_singular")}</strong>
          </div>
        `).join("")}
      </div>
    </details>
  ` : "";

  panel.className = "apply-panel-inline nightly-pricing-panel";
  panel.removeAttribute("aria-busy");
  panel.innerHTML = `
    <p class="unit-kicker">${t("nightly_pricing_kicker")}</p>
    <h2 class="section-title">${t("nightly_pricing_title")}</h2>
    <p class="apply-copy">${t("nightly_pricing_intro")}</p>
    <div class="stay-date-fields">
      <label>
        <span>${t("check_in")}</span>
        <input id="checkInDate" type="date" min="${firstAvailable}" ${bounds?.lastCheckout ? `max="${bounds.lastCheckout}"` : ""} value="${nightlySelection.checkIn}">
      </label>
      <label>
        <span>${t("check_out")}</span>
        <input id="checkOutDate" type="date" min="${firstAvailable}" ${bounds?.lastCheckout ? `max="${bounds.lastCheckout}"` : ""} value="${nightlySelection.checkOut}">
      </label>
    </div>
    ${seasonalRatesMarkup}
    <div class="stay-quote" id="stayQuote" aria-live="polite"></div>
    <a class="apply-button apply-button-large is-disabled" id="applyTopLink" aria-disabled="true">
      <span>${t("nightly_apply_button")}</span>
      <i class="fas fa-arrow-right"></i>
    </a>
    <a class="hidden-apply-link" id="applyPanelLink" aria-hidden="true" tabindex="-1"></a>
  `;

  const checkInInput = document.getElementById("checkInDate");
  const checkOutInput = document.getElementById("checkOutDate");
  const seasonalRatesToggle = panel.querySelector(".seasonal-rates-toggle");
  let pendingMapFrame = null;
  let mapRefreshSequence = 0;

  seasonalRatesToggle?.addEventListener("toggle", () => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      syncLeftColumnHeight();
      return;
    }

    const currentMapFrame = document.getElementById("mapFrame");
    const mapFrameStack = document.querySelector(".map-frame-stack");
    const mapCard = document.querySelector(".map");
    const leftColumn = document.querySelector(".left-column");
    const details = document.querySelector(".details");
    const mapSource = currentMapFrame?.getAttribute("src");

    if (!currentMapFrame || !mapFrameStack || !mapCard || !leftColumn || !details || !mapSource) {
      syncLeftColumnHeight();
      return;
    }

    mapRefreshSequence += 1;
    const refreshSequence = mapRefreshSequence;
    pendingMapFrame?.remove();

    const rowGap = Number.parseFloat(getComputedStyle(leftColumn).rowGap) || 0;
    const targetMapCardHeight = Math.max(0, (details.offsetHeight - rowGap) / 2);
    const targetMapHeight = Math.max(
      1,
      mapFrameStack.offsetHeight + targetMapCardHeight - mapCard.getBoundingClientRect().height
    );

    const nextMapFrame = currentMapFrame.cloneNode(false);
    nextMapFrame.removeAttribute("id");
    nextMapFrame.removeAttribute("src");
    nextMapFrame.setAttribute("aria-hidden", "true");
    nextMapFrame.setAttribute("loading", "eager");
    nextMapFrame.style.height = `${targetMapHeight}px`;
    nextMapFrame.style.bottom = "auto";
    nextMapFrame.style.opacity = "0";
    nextMapFrame.style.pointerEvents = "none";
    mapFrameStack.appendChild(nextMapFrame);
    pendingMapFrame = nextMapFrame;

    const fallbackTimer = window.setTimeout(() => {
      if (refreshSequence !== mapRefreshSequence) return;
      nextMapFrame.remove();
      pendingMapFrame = null;
      syncLeftColumnHeight();
    }, 8000);

    nextMapFrame.addEventListener("load", () => {
      window.setTimeout(() => {
        if (refreshSequence !== mapRefreshSequence || !seasonalRatesToggle.isConnected) {
          nextMapFrame.remove();
          return;
        }

        window.clearTimeout(fallbackTimer);
        syncLeftColumnHeight();

        requestAnimationFrame(() => {
          currentMapFrame.removeAttribute("id");
          nextMapFrame.id = "mapFrame";
          nextMapFrame.removeAttribute("aria-hidden");
          nextMapFrame.style.height = "";
          nextMapFrame.style.bottom = "";
          nextMapFrame.style.opacity = "";
          nextMapFrame.style.pointerEvents = "";
          currentMapFrame.remove();
          pendingMapFrame = null;
        });
      }, 150);
    }, { once: true });

    nextMapFrame.src = mapSource;
  });

  const updateQuote = () => {
    nightlySelection = { checkIn: checkInInput.value, checkOut: checkOutInput.value };
    checkOutInput.min = checkInInput.value || firstAvailable;

    const quoteElement = document.getElementById("stayQuote");
    const applyLink = document.getElementById("applyTopLink");

    if (!nightlySelection.checkIn || !nightlySelection.checkOut) {
      quoteElement.innerHTML = "";
      disableNightlyApplication(applyLink);
      syncLeftColumnHeight();
      return;
    }

    const quote = calculateNightlyQuote(
      unit.seasonalRates,
      nightlySelection.checkIn,
      nightlySelection.checkOut
    );

    if (quote.error) {
      const messageKey = quote.error === "unpriced_dates" ? "stay_dates_unavailable" : "stay_dates_invalid";
      quoteElement.innerHTML = `<p class="quote-error" role="alert">${t(messageKey)}</p>`;
      disableNightlyApplication(applyLink);
      syncLeftColumnHeight();
      return;
    }

    quoteElement.innerHTML = `
      <div class="quote-summary">
        <h3>${t("stay_price_breakdown")}</h3>
        ${quote.segments.map(segment => `
          <div class="quote-line">
            <span>${currency(segment.nightlyRate)} × ${segment.nights} ${segment.nights === 1 ? t("night_singular") : t("night_plural")}</span>
            <strong>${currency(segment.subtotal)}</strong>
          </div>
        `).join("")}
        <div class="quote-total">
          <span>${t("estimated_total")}</span>
          <strong>${currency(quote.total)}</strong>
        </div>
      </div>
    `;

    const query = new URLSearchParams({
      slug,
      unit: unit.title[lang] || unit.title.en || "",
      checkIn: nightlySelection.checkIn,
      checkOut: nightlySelection.checkOut,
      estimatedTotal: String(quote.total)
    });
    applyLink.href = `availability-request.html?${query.toString()}`;
    applyLink.classList.remove("is-disabled");
    applyLink.removeAttribute("aria-disabled");
    document.getElementById("applyPanelLink").href = applyLink.href;
    syncLeftColumnHeight();
  };

  checkInInput.addEventListener("change", updateQuote);
  checkOutInput.addEventListener("change", updateQuote);
  updateQuote();
}

function disableNightlyApplication(link) {
  link.removeAttribute("href");
  link.classList.add("is-disabled");
  link.setAttribute("aria-disabled", "true");
}

function renderUnitLoadError() {
  const panel = document.getElementById("unitActionPanel");
  if (!panel) return;
  panel.className = "apply-panel-inline action-panel-error";
  panel.removeAttribute("aria-busy");
  panel.innerHTML = `
    <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
    <p role="alert">${t("unit_options_error")}</p>
  `;
  syncLeftColumnHeight();
}
