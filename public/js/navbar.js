fetch('/partials/navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar').innerHTML = html;
  })
  .catch(err => console.error('Failed to load navbar:', err));
