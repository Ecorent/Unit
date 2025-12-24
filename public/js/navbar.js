// public/js/navbar.js
const navbarContainer = document.getElementById("navbar");

/* Immediately reserve space (prevents layout shift) */
navbarContainer.innerHTML = `<nav class="navbar"></nav>`;

fetch("/partials/navbar.html")
  .then(res => res.text())
  .then(html => {
    navbarContainer.innerHTML = html;

    /* Load auth logic AFTER navbar is painted */
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/js/authState.js";
    document.body.appendChild(script);
  })
  .catch(err => console.error("Failed to load navbar:", err));
