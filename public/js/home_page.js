document.querySelectorAll('.unit-carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const images = track.querySelectorAll('img');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');

  let index = 0;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prev.addEventListener('click', () => {
    index = (index - 1 + images.length) % images.length;
    update();
  });

  next.addEventListener('click', () => {
    index = (index + 1) % images.length;
    update();
  });
});
