const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const navbar = document.querySelector(".navbar");

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  navbar.classList.toggle("menu-open");
});
