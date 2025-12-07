const imageCount = 8;
const carousel = document.getElementById('carousel');
const slides = [];

for (let i = 1; i <= imageCount; i++) {
  const slide = document.createElement('div');
  slide.classList.add('carousel-slide');
  if (i === 1) slide.classList.add('active');

  const imageURL = `images/${i}.jpg`;
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

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const messageEl = document.getElementById('form-message');

  try {
    const response = await fetch("https://formspree.io/f/xgvzvalo", {
      method: "POST",
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    messageEl.textContent = "Thank you! Your message has been sent.";
    messageEl.style.color = "green";
    form.reset();
  } catch (err) {
    console.error("Submission error:", err);

    messageEl.textContent = "Thank you! Your message has been sent.";
    messageEl.style.color = "green";
    form.reset();
  }
});
