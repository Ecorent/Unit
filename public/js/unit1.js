const imageCount = 8;
const carousel = document.getElementById('carousel');

const blur = document.createElement('div');
blur.className = 'blur-bg';
carousel.appendChild(blur);

const track = document.createElement('div');
track.className = 'carousel-track';
carousel.appendChild(track);

for (let i = 1; i <= imageCount; i++) {
  const img = document.createElement('img');
  img.src = `images/unit1/${i}.jpg`;
  img.alt = `Apartment photo ${i}`;
  img.loading = 'lazy';
  track.appendChild(img);
}

const controls = document.createElement('div');
controls.className = 'carousel-controls';
controls.innerHTML = `
  <button id="prev">&#10094;</button>
  <button id="next">&#10095;</button>
`;
carousel.appendChild(controls);

const images = track.querySelectorAll('img');
let index = 0;

blur.style.backgroundImage = `url(${images[0].src})`;

function updateCarousel() {
  track.style.transform = `translateX(-${index * 100}%)`;
  blur.style.backgroundImage = `url(${images[index].src})`;
}

document.getElementById('prev').addEventListener('click', () => {
  index = (index - 1 + images.length) % images.length;
  updateCarousel();
});

document.getElementById('next').addEventListener('click', () => {
  index = (index + 1) % images.length;
  updateCarousel();
});


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
