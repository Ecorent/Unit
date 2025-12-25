// 🔑 SANITY CONFIG
const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

const query = encodeURIComponent(`
  *[_type == "unit" && published == true] | order(_createdAt desc) {
    title,
    price,
    address,
    sqft,
    bedrooms,
    slug,
    images[]{asset->{url}}
  }
`);

const SANITY_URL =
  `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

const unitsGrid = document.getElementById("unitsGrid");

// 🔄 FETCH & RENDER
fetch(SANITY_URL)
  .then(res => res.json())
  .then(data => {
    data.result.forEach(unit => {
      unitsGrid.appendChild(createUnitCard(unit));
    });

    initCarousels();
    initAnimations();
  });

// 🧱 CARD TEMPLATE
function createUnitCard(unit) {
  const card = document.createElement("div");
  card.className = "unit-card";

  const images = unit.images || [];

  card.innerHTML = `
    <div class="unit-carousel">
      <div class="carousel-blur"></div>
      <div class="price-badge">${unit.price || ""}</div>

      <div class="carousel-track">
        ${images.map(img => `<img src="${img.asset.url}" alt="">`).join("")}
      </div>

      <button class="carousel-btn prev">&#10094;</button>
      <button class="carousel-btn next">&#10095;</button>
    </div>

    <div class="unit-info">
      <h3>${unit.title}</h3>

      <div class="unit-meta address">
        <span><i class="fas fa-map-marker-alt"></i> ${unit.address}</span>
      </div>

      <div class="unit-meta">
        <span><i class="fas fa-ruler-combined"></i> ${unit.sqft} sqft</span>
        <span><i class="fas fa-bed"></i> ${unit.bedrooms} Bedrooms</span>
      </div>

      <a href="unit.html?slug=${unit.slug.current}" class="view-button">View Details</a>
    </div>
  `;

  return card;
}

// 🎠 CAROUSELS (your original logic)
function initCarousels() {
  document.querySelectorAll('.unit-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const images = track.querySelectorAll('img');
    const blur = carousel.querySelector('.carousel-blur');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');

    if (!images.length) return;

    let index = 0;

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      blur.style.backgroundImage = `url(${images[index].src})`;
    };

    blur.style.backgroundImage = `url(${images[0].src})`;

    prev.addEventListener('click', () => {
      index = (index - 1 + images.length) % images.length;
      update();
    });

    next.addEventListener('click', () => {
      index = (index + 1) % images.length;
      update();
    });
  });
}

// ✨ ANIMATIONS (unchanged)
function initAnimations() {
  const cards = document.querySelectorAll('.unit-card');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach(card => observer.observe(card));
}
