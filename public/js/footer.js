fetch("partials/footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch(err => console.error("Footer load error:", err));
