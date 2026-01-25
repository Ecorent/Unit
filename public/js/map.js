import { t } from "/js/i18n.js";

const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

let currentLang = localStorage.getItem("lang") || "en";
let unitCache = [];

const markers = {};
const cards = {};

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

const map = L.map("map", { 
  zoomControl: false,      
  attributionControl: false 
})
.setView([39.5, -98.35], 4);

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap &copy; CARTO" }
).addTo(map);

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

  requestAnimationFrame(() => {
    map.invalidateSize();
    fitMapToMarkers();
    updateVisibility();
  });
}

function createUnitCard(unit) {
  const card = document.createElement("div");
  card.className = "unit-card";

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
    markers[unit.slug.current]
      ?.getElement()
      ?.querySelector(".price-marker")
      ?.classList.add("active");
  });

  card.addEventListener("mouseleave", () => {
    markers[unit.slug.current]
      ?.getElement()
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

  const bubble = () =>
    marker.getElement()?.querySelector(".price-marker");

  marker.on("mouseover", () => {
    bubble()?.classList.add("active");
    cards[key]?.classList.add("active");
    cards[key]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  marker.on("mouseout", () => {
    bubble()?.classList.remove("active");
    cards[key]?.classList.remove("active");
  });

  marker.on("click", () => {
    window.location.href = `/unit.html?slug=${key}`;
  });

  markers[key] = marker;
}

function fitMapToMarkers() {
  const latLngs = Object.values(markers).map(m => m.getLatLng());
  if (!latLngs.length) return;

  let boundsOptions = { padding: [60, 60] };

  if (window.innerWidth <= 768) {
    const sheetHeight = window.innerHeight * 0.6; 
    const adjustments = {
      top: 100,  
      left: 100, 
      right: 50, 
      bottomBuffer: 50 
    };

    boundsOptions = {
      paddingTopLeft: [adjustments.left, adjustments.top],
      paddingBottomRight: [adjustments.right, sheetHeight + adjustments.bottomBuffer]
    };
  }

  map.fitBounds(latLngs, boundsOptions);
}

function updateVisibility() {
  const bounds = map.getBounds();

  unitCache.forEach(unit => {
    const key = unit.slug.current;
    const marker = markers[key];
    const card = cards[key];
    if (!marker || !card) return;

    const visible = bounds.contains(marker.getLatLng());
    card.style.display = visible ? "" : "none";
    marker.setOpacity(visible ? 1 : 0);
  });
}

map.on("moveend zoomend", updateVisibility);

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
  }, { threshold: 0.01 });

  document.querySelectorAll(".unit-card").forEach(card =>
    observer.observe(card)
  );
}

window.addEventListener("languageChanged", e => {
  currentLang = e.detail;
  render();
});

if (window.innerWidth <= 768) {
  const sheet = document.querySelector(".map-listings");
  const content = sheet.querySelector(".map-units");
  const mapContainer = document.querySelector(".map-container");

  let startY = 0;
  let startTranslate = 0;
  let currentY = 0;
  let dragging = false;

  const positions = {
    collapsed: Math.round(window.innerHeight * 0.80),
    half: Math.round(window.innerHeight * 0.4),
    expanded: 0
  };

  function setPosition(y) {
    currentY = y;
    sheet.style.transform = `translateY(${y}px)`;
  }

  function snapTo(y) {
    sheet.style.transition = "transform 0.25s ease";
    setPosition(y);

    sheet.classList.toggle("expanded", y === positions.expanded);

    setTimeout(() => {
      sheet.style.transition = "";
    }, 250);
  }

  // Initialize sheet and map
  setPosition(positions.half);

  sheet.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    startY = touch.clientY;
    startTranslate = currentY;

    const isExpanded = sheet.classList.contains("expanded");
    const contentAtTop = content.scrollTop === 0;

    if (!isExpanded || contentAtTop) {
      dragging = true;
      sheet.style.transition = "none";
    } else {
      dragging = false;
    }
  }, { passive: true });

  sheet.addEventListener("touchmove", e => {
    if (!dragging) return;

    const touch = e.touches[0];
    const delta = touch.clientY - startY;

    const next = Math.min(
      positions.collapsed,
      Math.max(positions.expanded, startTranslate + delta)
    );

    setPosition(next);
    e.preventDefault();
  }, { passive: false });

  sheet.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;

    const snapPoints = Object.values(positions)
      .map(p => ({ pos: p, dist: Math.abs(currentY - p) }))
      .sort((a, b) => a.dist - b.dist);

    snapTo(snapPoints[0].pos);
  });
}

