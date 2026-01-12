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

/* ===== SANITY QUERY ===== */
const query = encodeURIComponent(`
  *[_type == "unit"]{
    title{en, es},
    price,
    address,
    slug,
    images[]{asset->{url}},
    location
  }
`);

const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

/* ===== MAP INIT ===== */
const map = L.map("map", { zoomControl: false }).setView([39.5, -98.35], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);

/* ===== ICON ===== */
function priceIcon(price) {
  return L.divIcon({
    html: `<div class="price-pin">$${price.toLocaleString()}</div>`,
    className: "",
    iconSize: [0, 0]
  });
}

/* ===== FETCH ===== */
fetch(url)
  .then(res => res.json())
  .then(({ result }) => {
    unitCache = result.filter(u => u.location);
    render(currentLang);
  });

/* ===== RENDER ===== */
function render(lang) {
  const container = document.getElementById("mapUnits");
  container.innerHTML = "";

  unitCache.forEach(unit => {
    const card = document.createElement("div");
    card.className = "map-unit-card";

    const img = unit.images?.[0]?.asset?.url || "/images/placeholder.jpg";

    card.innerHTML = `
      <div class="map-unit-img" style="background-image:url('${img}')"></div>
      <div class="map-unit-info">
        <h3>${unit.title[lang]}</h3>
        <div class="map-unit-meta">
          $${unit.price.toLocaleString()} / ${t("per_month")}
        </div>
      </div>
    `;

    container.appendChild(card);

    // Marker
    if (!markers[unit.slug.current]) {
      const marker = L.marker(
        [unit.location.lat, unit.location.lng],
        { icon: priceIcon(unit.price) }
      ).addTo(map);

      marker.bindPopup(`
        <strong>${unit.title[lang]}</strong><br>
        $${unit.price.toLocaleString()} / ${t("per_month")}
      `);

      markers[unit.slug.current] = marker;

      card.addEventListener("mouseenter", () => marker.openPopup());
      card.addEventListener("mouseleave", () => marker.closePopup());

      card.addEventListener("click", () => {
        map.setView(
          [unit.location.lat, unit.location.lng],
          16,
          { animate: true }
        );
        window.location.href = `/unit.html?slug=${unit.slug.current}`;
      });
    }
  });
}

/* ===== LANGUAGE CHANGE ===== */
window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  render(currentLang);
});
