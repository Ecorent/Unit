import { t } from "/js/i18n.js";

/* ===== SANITY CONFIG ===== */
const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

/* ===== LANGUAGE ===== */
let currentLang = localStorage.getItem("lang") || "en";

/* ===== STATE ===== */
let unitCache = [];
const markers = {};

/* ===== QUERY ===== */
const query = encodeURIComponent(`
  *[_type == "unit" && published == true]
  | order(order asc, _createdAt desc) {
    title{en, es},
    price,
    address,
    sqft,
    bedrooms,
    slug,
    images[]{asset->{url}},
    location
  }
`);

const SANITY_URL =
  `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

/* ===== MAP INIT ===== */
const map = L.map("map", { zoomControl: false }).setView([39.5, -98.35], 4);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; OpenStreetMap &copy; CARTO"
  }
).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);

/* ===== PRICE FORMAT ===== */
function formatPrice(price) {
  return `$${Number(price).toLocaleString()} / ${t("per_month")}`;
}

/* ===== FETCH ===== */
fetch(SANITY_URL)
  .then(res => res.json())
  .then(({ result }) => {
    unitCache = result || [];
    render();
  });

/* ===== RENDER ===== */
function render() {
  currentLang = localStorage.getItem("lang") || "en";

  const container = document.getElementById("mapUnits");
  container.innerHTML = "";

  unitCache.forEach(unit => {
    container.appendChild(createUnitCard(unit));
    renderMarker(unit);
  });

  initCarousels();
  initAnimations();

  requestAnimationFrame(() => {
    map.invalidateSize();
  });
}

/* ===== CARD (HOME STYLE) ===== */
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
        ${images.map(img => `<img src="${img.asset.url}" alt="">`).join("")}
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
          ${unit.bedrooms} ${t("bedrooms")}
        </span>
      </div>

      <a href="/unit.html?slug=${unit.slug.current}" class="view-button">
        ${t("view_details")}
      </a>
    </div>
  `;

  return card;
}

/* ===== MARKER (UNCHANGED) ===== */
function renderMarker(unit) {
  if (!unit.location?.lat || !unit.location?.lng) return;

  const key = unit.slug.current;
  if (markers[key]) return;

  const marker = L.marker(
    [unit.location.lat, unit.location.lng]
  ).addTo(map);

  markers[key] = marker;
}

/* ===== CAROUSELS ===== */
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
      blur.style.backgroundImage = `url(${images[index].src})`;
    };

    blur.style.backgroundImage = `url(${images[0].src})`;

    prev.onclick = () => {
      index = (index - 1 + images.length) % images.length;
      update();
    };

    next.onclick = () => {
      index = (index + images.length + 1) % images.length;
      update();
    };
  });
}

/* ===== ANIMATIONS ===== */
function initAnimations() {
  const cards = document.querySelectorAll(".unit-card");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
}

/* ===== LANGUAGE CHANGE ===== */
window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  render();
});

/* ===== BFCACHE ===== */
window.addEventListener("pageshow", event => {
  if (event.persisted) render();
});
