// public/js/navbar.js
fetch('/partials/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar').innerHTML = html;

    // Load auth state AFTER navbar is present
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/js/authState.js';
    document.body.appendChild(script);
  })
  .catch(err => console.error('Failed to load navbar:', err));
