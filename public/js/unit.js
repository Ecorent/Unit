// 🔑 SANITY CONFIG
const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

// 🔎 GET SLUG
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.body.innerHTML = "<h1>Unit not found</h1>";
  throw new Error("Missing slug");
}

// 🧠 QUERY
const query = encodeURIComponent(`
  *[_type == "unit" && slug.current == "${slug}"][0]{
    title{en},
    price,
    address,
    bedrooms,
    bathrooms,
    sqft,
    utilitiesIncluded{en},
    petFriendly,
    washerDryer{en},
    locationHighlights{en},
    parking{en},
    images[]{asset->{url}}
  }
`);

const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

// 🔄 FETCH UNIT
fetch(url)
  .then(res => res.json())
  .then(({ result }) => {
    if (!result) {
      document.body.innerHTML = "<h1>Unit not found</h1>";
      return;
    }
    renderUnit(result);
  });

// 💰 PRICE FORMATTER
function formatPrice(price) {
  return `$${Number(price).toLocaleString()} / month`;
}

// 🧱 RENDER UNIT
function renderUnit(unit) {
  document.getElementById("pageTitle").textContent = unit.title.en;
  document.getElementById("unitTitle").textContent = unit.title.en;
  document.getElementById("unitPrice").textContent = formatPrice(unit.price);

  const details = document.getElementById("unitDetails");
  details.innerHTML = `
    <li><i class="fas fa-bed"></i>${unit.bedrooms} Bedrooms</li>
    <li><i class="fas fa-bath"></i>${unit.bathrooms} Bathroom</li>
    <li><i class="fas fa-ruler-combined"></i>${unit.sqft} sq ft</li>
    <li>
      <i class="fas ${unit.petFriendly ? "fa-dog" : "fa-ban"}"></i>
      ${unit.petFriendly ? "Pet friendly" : "No pets allowed"}
    </li>
    <li><i class="fas fa-tint"></i>${unit.utilitiesIncluded.en}</li>
    <li><i class="fas fa-soap"></i>${unit.washerDryer.en}</li>
    <li><i class="fas fa-box-archive"></i>${unit.parking.en}</li>
    <li>
      <i class="fas fa-star"></i>
      ${unit.locationHighlights.en}
    </li>
  `;

  document.getElementById("mapFrame").src =
    `https://maps.google.com/maps?q=${encodeURIComponent(unit.address)}&output=embed`;

  initCarousel(unit.images || []);
}

// 🎠 CAROUSEL
function initCarousel(images) {
  const carousel = document.getElementById("carousel");
  if (!images.length) return;

  const blur = document.createElement("div");
  blur.className = "blur-bg";
  carousel.appendChild(blur);

  const track = document.createElement("div");
  track.className = "carousel-track";
  carousel.appendChild(track);

  images.forEach(img => {
    const image = document.createElement("img");
    image.src = img.asset.url;
    image.loading = "lazy";
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

  blur.style.backgroundImage = `url(${imgs[0].src})`;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    blur.style.backgroundImage = `url(${imgs[index].src})`;
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

// 📩 CONTACT FORM (unchanged logic)
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const messageEl = document.getElementById("form-message");

  const data = {
    name: e.target.name.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    message: e.target.message.value
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    messageEl.textContent = "Thank you! Your inquiry has been sent.";
    messageEl.style.color = "green";
    e.target.reset();
  } catch {
    messageEl.textContent = "Something went wrong. Please try again.";
    messageEl.style.color = "red";
  }
});
