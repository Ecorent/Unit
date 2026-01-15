import { t } from "/js/i18n.js";

const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

let currentLang = localStorage.getItem("lang") || "en";
let unitCache = [];
const markers = {};
const cards = {};
let hasFitInitialBounds = false;

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
    latitude,
    longitude
  }
`);

const SANITY_URL =
  `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

const map = L.map("map", { zoomControl: false }).setView([39.5, -98.35], 4);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap &copy; CARTO" }
).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);

function formatPrice(price) {
  return `$${Number(price).toLocaleString()} / ${t("per_month")}`;
}

function createPriceMarker(price) {
  return L.divIcon({
    className: "",
    html: `<div class="price-marker">$${Number(price).toLocaleString()}</div>`,
    iconSize: null
  });
}

fetch(SANITY_URL)
  .then(res => res.json())
  .then(({ result }) => {
    unitCache = result || [];
    render();
  });

function render() {
  currentLang = localStorage.getItem("lang") || "en";

  const container = document.getElementById("mapUnits");
  container.innerHTML = "";

  Object.values(markers).forEach(m => map.removeLayer(m));
  Object.keys(markers).forEach(k => delete markers[k]);
  Object.keys(cards).forEach(k => delete cards[k]);

  unitCache.forEach(unit => {
    const card = createUnitCard(unit);
    container.appendChild(card);
    cards[unit.slug.current] = card;
    renderMarker(unit);
  });

  initCarousels();
  initAnimations();
  bindMapFiltering();

  requestAnimationFrame(() => {
    map.invalidateSize();
    if (!hasFitInitialBounds) {
      fitMapToMarkers();
      hasFitInitialBounds = true;
    }
  });
}

function createUnitCard(unit) {
  const card = document.createElement("div");
  card.className = "unit-card";
  card.dataset.slug = unit.slug.current;

  const images = unit.images || [];
  const title = unit.title?.[currentLang] || unit.title?.en || "";

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

  card.addEventListener("mouseenter", () => {
    const marker = markers[unit.slug.current];
    const bubble = marker?.getElement()?.querySelector(".price-marker");
    bubble?.classList.add("active");
    if (marker) {
      map.panTo(marker.getLatLng(), { animate: true, duration: 0.4 });
    }
  });

  card.addEventListener("mouseleave", () => {
    const marker = markers[unit.slug.current];
    marker?.getElement()
      ?.querySelector(".price-marker")
      ?.classList.remove("active");
  });

  return card;
}

function renderMarker(unit) {
  if (
    typeof unit.latitude !== "number" ||
    typeof unit.longitude !== "number"
  ) return;

  const key = unit.slug.current;

  const marker = L.marker(
    [unit.latitude, unit.longitude],
    { icon: createPriceMarker(unit.price) }
  ).addTo(map);

  const getBubble = () =>
    marker.getElement()?.querySelector(".price-marker");

  marker.on("mouseover", () => {
    getBubble()?.classList.add("active");
    const card = cards[key];
    card.classList.add("active");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  marker.on("mouseout", () => {
    getBubble()?.classList.remove("active");
    cards[key].classList.remove("active");
  });

  marker.on("click", () => {
    window.location.href = `/unit.html?slug=${key}`;
  });

  markers[key] = marker;
}

function bindMapFiltering() {
  const updateVisibility = () => {
    const bounds = map.getBounds();

    unitCache.forEach(unit => {
      const key = unit.slug.current;
      const card = cards[key];
      const marker = markers[key];
      if (!marker) return;

      const visible = bounds.contains(marker.getLatLng());
      card.style.display = visible ? "" : "none";
      marker.setOpacity(visible ? 1 : 0);
    });
  };

  map.on("moveend zoomend", updateVisibility);
  updateVisibility();
}

function fitMapToMarkers() {
  const latLngs = Object.values(markers).map(m => m.getLatLng());
  if (latLngs.length) {
    map.fitBounds(latLngs, { padding: [60, 60] });
  }
}

function initCarousels() {
  document.querySelectorAll(".unit-carousel").forEach(carousel => {
    if (carousel.dataset.initialized) return;
    carousel.dataset.initialized = "true";

    const track = carousel.querySelector(".carousel-track");
    const images = track.querySelectorAll("img");
    const blur = carousel.querySelector(".carousel-blur");
    const prev = carousel.querySelector(".prev");
    const next = carousel.querySelector(".next");

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
      index = (index + 1) % images.length;
      update();
    };
  });
}

function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".unit-card").forEach(card =>
    observer.observe(card)
  );
}

window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  hasFitInitialBounds = false;
  render();
});

window.addEventListener("pageshow", e => {
  if (e.persisted) {
    hasFitInitialBounds = false;
    render();
  }
});
