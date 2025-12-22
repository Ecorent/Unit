const imageCount = 8;
const carousel = document.getElementById('carousel');
const slides = [];

for (let i = 1; i <= imageCount; i++) {
  const slide = document.createElement('div');
  slide.classList.add('carousel-slide');
  if (i === 1) slide.classList.add('active');

  const imageURL = `images/unit1/${i}.jpg`;
  slide.innerHTML = `
    <div class="blur-bg" style="background-image: url('${imageURL}');"></div>
    <img src="${imageURL}" alt="Apartment photo ${i}" loading="lazy" />
  `;
  carousel.appendChild(slide);
  slides.push(slide);
}

let current = 0;
const nav = document.createElement('div');
nav.classList.add('carousel-controls');
nav.innerHTML = `
  <button id="prev">&#10094;</button>
  <button id="next">&#10095;</button>
`;
carousel.appendChild(nav);

document.getElementById('prev').onclick = () => {
  slides[current].classList.remove('active');
  current = (current - 1 + slides.length) % slides.length;
  slides[current].classList.add('active');
};

document.getElementById('next').onclick = () => {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
};

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
