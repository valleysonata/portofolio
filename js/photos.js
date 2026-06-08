(function() {
  "use strict";

  var content = document.getElementById("photos-content");
  var lightbox = null;
  var currentIndex = 0;
  var currentAlbum = "all";

  var photos = [
    { src: "assets/wallpaper.jpg", title: "Wallpaper", album: "wallpapers" },
    { src: "assets/wallpaper.jpg", title: "Desktop Background", album: "wallpapers" },
    { src: "assets/safari-icon.png", title: "Safari Icon", album: "all" },
    { src: "assets/spotify-icon.png", title: "Spotify Icon", album: "all" },
    { src: "assets/github-icon.png", title: "GitHub Icon", album: "all" },
    { src: "assets/gmail-icon.png", title: "Gmail Icon", album: "all" },
  ];

  function getFilteredPhotos() {
    if (currentAlbum === "all") return photos;
    return photos.filter(function(p) { return p.album === currentAlbum; });
  }

  function render() {
    var filtered = getFilteredPhotos();
    var html = '<div class="photos-grid">';
    filtered.forEach(function(photo, i) {
      html += '<div class="photos-thumb" data-index="' + i + '">' +
        '<img src="' + photo.src + '" alt="' + photo.title + '" loading="lazy">' +
      '</div>';
    });
    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll(".photos-thumb").forEach(function(el) {
      el.addEventListener("click", function() {
        currentIndex = parseInt(el.getAttribute("data-index"));
        openLightbox();
      });
    });
  }

  function openLightbox() {
    var filtered = getFilteredPhotos();
    if (!filtered[currentIndex]) return;

    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "photos-lightbox";
      lightbox.innerHTML =
        '<button class="photos-lightbox-close">&times;</button>' +
        '<button class="photos-lightbox-nav photos-lightbox-prev">&#9664;</button>' +
        '<img src="" alt="">' +
        '<button class="photos-lightbox-nav photos-lightbox-next">&#9654;</button>';
      document.body.appendChild(lightbox);

      lightbox.querySelector(".photos-lightbox-close").addEventListener("click", closeLightbox);
      lightbox.querySelector(".photos-lightbox-prev").addEventListener("click", function() {
        currentIndex = (currentIndex - 1 + filtered.length) % filtered.length;
        updateLightbox();
      });
      lightbox.querySelector(".photos-lightbox-next").addEventListener("click", function() {
        currentIndex = (currentIndex + 1) % filtered.length;
        updateLightbox();
      });
      lightbox.addEventListener("click", function(e) {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener("keydown", function(e) {
        if (!lightbox.classList.contains("visible")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") { currentIndex = (currentIndex - 1 + filtered.length) % filtered.length; updateLightbox(); }
        if (e.key === "ArrowRight") { currentIndex = (currentIndex + 1) % filtered.length; updateLightbox(); }
      });
    }

    updateLightbox();
    requestAnimationFrame(function() { lightbox.classList.add("visible"); });
  }

  function updateLightbox() {
    var filtered = getFilteredPhotos();
    var photo = filtered[currentIndex];
    if (!photo) return;
    lightbox.querySelector("img").src = photo.src;
    lightbox.querySelector("img").alt = photo.title;
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove("visible");
  }

  document.querySelectorAll(".photos-sidebar-item").forEach(function(el) {
    el.addEventListener("click", function() {
      document.querySelectorAll(".photos-sidebar-item").forEach(function(s) { s.classList.remove("active"); });
      el.classList.add("active");
      currentAlbum = el.getAttribute("data-album");
      render();
    });
  });

  window.PhotosApp = {
    init: function() { render(); }
  };
})();
