const unitData = {
  title: "4BR Downtown GR Apartment",
  price: "$2,400 / month",
  features: [
    { icon: "fa-bed", text: "4 Bedrooms" },
    { icon: "fa-bath", text: "1 Bathroom" },
    { icon: "fa-ruler-combined", text: "1,200 sq ft" },
    { icon: "fa-tint", text: "Gas and heating included" },
    { icon: "fa-dog", text: "Pet friendly" },
    { icon: "fa-soap", text: "In-unit washer & dryer" },
    { icon: "fa-car", text: "Street parking available" }
  ],
  images: 8
};

const carousel = document.getElementById("carousel");
const slides = [];

for (let i = 1; i <= unitData.images; i++) {
  const slide = document.createElement("div");
  slide.className = "carousel-slide" + (i === 1 ? " active" : "");

  const imageURL = `images/unit1/${i}.jpg`;

  slide.innerHTML = `
    <div class="blur-bg" style="background-image:url('${imageURL}')"></div>
    <img src="${imageURL}" loading="lazy" />
  `;

  carousel.appendChild(slide);
  slides.push(slide);
}

let current = 0;

const controls = document.createElement("div");
controls.className = "carousel-controls";
controls.innerHTML = `
  <button id="prev">&#10094;</button>
  <button id="next">&#10095;</button>
`;
carousel.appendChild(controls);

document.getElementById("prev").onclick = () => {
  slides[current].classList.remove("active");
  current = (current - 1 + slides.length) % slides.length;
  slides[current].classList.add("active");
};

document.getElementById("next").onclick = () => {
  slides[current].classList.remove("active");
  current = (current + 1) % slides.length;
  slides[current].classList.add("active");
};

const details = document.getElementById("details");
details.innerHTML = `
  <h2 class="section-title">${unitData.title}</h2>
  <ul>
    <li><i class="fas fa-money-bill-wave"></i>${unitData.price}</li>
    ${unitData.features.map(f => `
      <li><i class="fas ${f.icon}"></i>${f.text}</li>
    `).join("")}
  </ul>
`;

/* ================= CONTACT FORM ================= */

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageEl = document.getElementById('form-message');

  const data = {
    name: e.target.name.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    message: e.target.message.value
  };

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error();

    messageEl.textContent = "Thank you! Your inquiry has been sent.";
    messageEl.style.color = "green";
    e.target.reset();
  } catch {
    messageEl.textContent = "Something went wrong. Please try again.";
    messageEl.style.color = "red";
  }
});
