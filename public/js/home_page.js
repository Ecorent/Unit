import { t, tPlural } from "/js/i18n.js";

// 🔑 SANITY CONFIG
// 🌍 CURRENT LANGUAGE
let currentLang = localStorage.getItem("lang") || "en";

// 🧠 QUERY
const unitsGrid = document.getElementById("unitsGrid");

// 📦 CACHE
let unitsCache = [];

// 💰 PRICE FORMATTER
function formatPrice(price) {
  return `$${Number(price).toLocaleString()} / ${t("per_month")}`;
}

function sanityImageUrl(url, width, quality = 78) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}auto=format&w=${width}&q=${quality}&fit=max`;
}

// 🔄 FETCH ONCE
fetch("/api/units")
  .then(res => res.json())
  .then(({ result }) => {
    unitsCache = result || [];
    renderUnits();
  });

// 🖼️ RENDER
function renderUnits() {
  currentLang = localStorage.getItem("lang") || "en";
  unitsGrid.innerHTML = "";

  unitsCache.forEach(unit => {
    unitsGrid.appendChild(createUnitCard(unit));
  });

  initCarousels();
}

// 🧱 CARD TEMPLATE
function createUnitCard(unit) {
  const card = document.createElement("div");
  card.className = "unit-card";

  const images = unit.images || [];
  const title =
    unit.title?.[currentLang] || unit.title?.en || "";

  card.innerHTML = `
    <div class="unit-carousel">
      <div class="carousel-blur"></div>
      <div class="price-badge">${formatPrice(unit.price)}</div>

      <div class="carousel-track">
        ${images
          .filter(img => img?.asset?.url)
          .map((img, index) => {
            const fullUrl = sanityImageUrl(img.asset.url, 760);
            const previewUrl = sanityImageUrl(img.asset.url, 80, 45);
            return `<img src="${fullUrl}" data-preview-src="${previewUrl}" alt="${title}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">`;
          })
          .join("")}
      </div>

      <button class="carousel-btn prev">&#10094;</button>
      <button class="carousel-btn next">&#10095;</button>
    </div>

    <div class="unit-info">
      <h3>${title}</h3>

      <div class="unit-meta address">
        <span>
          <i class="fas fa-map-marker-alt"></i>
          ${unit.address}
        </span>
      </div>

      <div class="unit-meta">
        <span>
          <i class="fas fa-ruler-combined"></i>
          ${unit.sqft} ${t("sqft_unit")}
        </span>
        <span>
          <i class="fas fa-bed"></i>
          ${unit.bedrooms} ${tPlural("bedroom", unit.bedrooms)}
        </span>
      </div>

      <a href="unit.html?slug=${unit.slug.current}" class="view-button">
        ${t("view_details")}
      </a>
    </div>
  `;

  return card;
}

// 🎠 CAROUSELS
function initCarousels() {
  document.querySelectorAll(".unit-carousel").forEach(carousel => {
    if (carousel.dataset.initialized) return;
    carousel.dataset.initialized = "true";

    const track = carousel.querySelector(".carousel-track");
    const images = track.querySelectorAll("img");
    const blur = carousel.querySelector(".carousel-blur");
    const prev = carousel.querySelector(".prev");
    const next = carousel.querySelector(".next");

    if (!images.length) return;

    let index = 0;

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      blur.style.backgroundImage = `url(${images[index].dataset.previewSrc || images[index].src})`;
    };

    blur.style.backgroundImage = `url(${images[0].dataset.previewSrc || images[0].src})`;

    prev.onclick = () => {
      index = (index - 1 + images.length) % images.length;
      update();
    };

    next.onclick = () => {
      index = (index + 1) % images.length;
      update();
    };
  });
}

// 🌍 LANGUAGE CHANGE LISTENER
window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  renderUnits();
});

// 🔁 HANDLE BROWSER BACK / FORWARD CACHE
window.addEventListener("pageshow", (event) => {
  currentLang = localStorage.getItem("lang") || "en";
  if (event.persisted) {
    renderUnits();
  }
});

