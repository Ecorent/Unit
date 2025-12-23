// public/js/navbar.js
const navbarContainer = document.getElementById("navbar");
navbarContainer.innerHTML = `
  <nav class="navbar auth-loading"></nav>
`;

fetch("/partials/navbar.html")
  .then(res => res.text())
  .then(html => {
    navbarContainer.innerHTML = html;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/js/authState.js";
    document.body.appendChild(script);
  })
  .catch(err => console.error("Failed to load navbar:", err));
