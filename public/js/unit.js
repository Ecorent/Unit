import { t, tPlural } from "/js/i18n.js";

// 🔑 SANITY CONFIG
// 🌍 CURRENT LANGUAGE
let currentLang = localStorage.getItem("lang") || "en";

// 📦 CACHE
let unitCache = null;
let formMessageState = null; // "success" | "error" | null

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
  .then(res => res.json())
  .then(({ result }) => {
    if (!result) {
      document.body.innerHTML = `<h1>${t("unit_not_found")}</h1>`;
      return;
    }

    unitCache = result;
    renderUnit(currentLang);
  });

// 💰 PRICE FORMATTER
function formatPrice(price) {
  return `$${Number(price).toLocaleString()} / ${t("per_month")}`;
}

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
  document.getElementById("unitPrice").textContent = formatPrice(unit.price);
  updateApplicationLinks(unit, lang);

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
  document.getElementById("applyTopLink").href = href;
  document.getElementById("applyPanelLink").href = href;
}
