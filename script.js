document.addEventListener('DOMContentLoaded', () => {

  // ---------- JSON'dan Veriyi Çek ----------
  fetch('posts.json')
    .then(response => response.json())
    .then(posts => {

      // ---------- Blog Listeleme ----------
      const blogGrid = document.getElementById('blog-grid') || document.getElementById('blog-list');
      if(blogGrid){
        posts.forEach(post => {
          const card = document.createElement('div');
          card.classList.add('blog-card');
          card.innerHTML = `
            <img src="${post.cover}" alt="${post.title}" class="cover">
            <h3>${post.title}</h3>
            <p>${post.summary}</p>
            <a href="post.html?id=${post.id}">${post.linkText}</a>
          `;
          blogGrid.appendChild(card);

          card.addEventListener('click', () => {
            window.location.href = `post.html?id=${post.id}`;
          });
        });
      }

      // ---------- Arama ----------
const searchInput = document.getElementById("blog-search");
const searchBtn = document.getElementById("search-btn");

function runSearch() {
  const query = searchInput.value.toLowerCase();
  const filtered = posts.filter(post => 
    post.title.toLowerCase().includes(query)
  );

  blogGrid.innerHTML = "";
  filtered.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('blog-card');
    card.innerHTML = `
      <img src="${post.cover}" alt="${post.title}" class="cover">
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      <a href="post.html?id=${post.id}">${post.linkText}</a>
    `;
    blogGrid.appendChild(card);

    card.addEventListener('click', () => {
      window.location.href = `post.html?id=${post.id}`;
    });
  });
}

if (searchInput) {
  // Yazdıkça arama
  searchInput.addEventListener("input", runSearch);
}

// Butonla arama (istersen)
if (searchBtn) {
  searchBtn.addEventListener("click", runSearch);
}


      // ---------- Post Sayfası ----------
      const postContainer = document.querySelector('.post-container');
      if(postContainer){
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'));
        const post = posts.find(p => p.id === id);

        if(post){
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = post.content;

          const images = tempDiv.querySelectorAll("img");

          const textOnly = tempDiv.cloneNode(true);
          textOnly.querySelectorAll("img").forEach(img => img.remove());

          postContainer.innerHTML = `
            <h1 id="post-title">${post.title}</h1>
            <div style="display:inline-block;padding:6px 12px;border:2px solid #4CAF50;color:#4CAF50;border-radius:8px;margin:5px 0 15px 0;font-size:14px;font-weight:600;">
              Paylaşan: ${post.author}
            </div>
            <p><em>${post.date}</em></p>
            <img src="${post.cover}" id="main-post-image" style="width:100%;border-radius:15px;cursor:pointer;margin-bottom:20px;">
            <div id="post-text">${textOnly.innerHTML}</div>
            <div id="hidden-images" style="display:none;"></div>
          `;

          const hiddenDiv = document.getElementById("hidden-images");
          images.forEach(img => hiddenDiv.appendChild(img));

          // ---------- Download link tıklaması ile mail gönder & dosya indir ----------
          const downloadLink = postContainer.querySelector('a[download]');
          if(downloadLink){
            downloadLink.addEventListener('click', (e) => {
              e.preventDefault();

              fetch("https://formspree.io/f/xldkonng", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: "Oyun Yüklendi",
                  email: "Oyun@example.com",
                  subject: `Kullanıcı "${post.title}" oyununu indirdi.`,
                  message: `Kullanıcı "${post.title}" oyununu indirdi.`
                })
              }).then(() => console.log("Mail gönderildi!"))
                .catch(err => console.error(err));

              const url = downloadLink.getAttribute('href');
              const a = document.createElement('a');
              a.href = url;
              a.download = url.split('/').pop();
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            });
          }

        } else {
          postContainer.innerHTML = "<p>Gönderi bulunamadı.</p>";
        }
      }

    })
    .catch(err => console.error('JSON yüklenirken hata:', err));

  // ---------- Hamburger ----------
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if(hamburger){
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // ---------- Contact Form ----------
  const contactForm = document.getElementById("contact-form");
  if(contactForm){
    contactForm.addEventListener("submit", function(e){
      e.preventDefault();
      const name = this.name.value;
      const email = this.email.value;
      const message = this.message.value;
      const subject = encodeURIComponent(`İletişim Formu Mesajı: ${name}`);
      const body = encodeURIComponent(`Ad: ${name}\nEmail: ${email}\nMesaj:\n${message}`);
      window.location.href = `mailto:seningmail@gmail.com?subject=${subject}&body=${body}`;
      const status = document.getElementById("form-status");
      if(status) status.textContent = "Mailiniz açılıyor...";
    });
  }
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('comment-form');
  const status = document.getElementById('form-status');

  // Post ID ve başlığını almak için URL'den çekiyoruz
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  // posts.json'dan title çek
  fetch("posts.json")
    .then(r => r.json())
    .then(posts => {
      const post = posts.find(p => p.id === id);
      const postTitle = post ? post.title : "Bilinmeyen Post";

      form.addEventListener('submit', function(e){
        e.preventDefault();

        const nameInput = document.getElementById('name').value.trim() || "Anonim";
        const messageInput = document.getElementById('message').value.trim();

        if(messageInput === "") return;

        const finalName = `${nameInput} - ${postTitle}`;

        // LocalStorage kaydı
        const saved = JSON.parse(localStorage.getItem("comments_" + id)) || [];
        saved.push({
          name: finalName,
          text: messageInput,
          date: new Date().toLocaleString()
        });
        localStorage.setItem("comments_" + id, JSON.stringify(saved));

        // Formspree gönderimi
        const data = new FormData(form);
        data.set('name', finalName); // Formspree için de finalName kullan

        fetch(form.action, {
          method: form.method,
          body: data,
          headers: { 'Accept': 'application/json' }
        }).then(response => {
          if(response.ok){
            status.textContent = "Yorumunuz gönderildi! Teşekkürler.";
            form.reset();
            loadComments();
          } else {
            status.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
          }
        }).catch(err => {
          status.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
          console.error(err);
        });
      });

      // Yorumları yükleme
      const commentsDiv = document.createElement('div');
      commentsDiv.id = 'comments';
      form.parentNode.insertBefore(commentsDiv, status);

      function loadComments(){
        const saved = JSON.parse(localStorage.getItem("comments_" + id)) || [];
        commentsDiv.innerHTML = "";

        if(saved.length === 0){
          commentsDiv.innerHTML = "<p>Henüz yorum yok.</p>";
          return;
        }

        saved.forEach(c => {
          const div = document.createElement('div');
          div.classList.add('comment');
          div.innerHTML = `
            <p><strong>${c.name}</strong> <em>${c.date}</em></p>
            <p>${c.text}</p>
            <hr>
          `;
          commentsDiv.appendChild(div);
        });
      }

      loadComments();
    });
});



});

// ---------- LIGHTBOX (Resim Önizleme + Sağ Sol Buton) ----------
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".close-btn");
  const leftBtn = document.querySelector(".nav-btn.left");
  const rightBtn = document.querySelector(".nav-btn.right");

  let images = [];
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightbox.style.display = "flex";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  function closeLightbox() {
    lightbox.style.display = "none";
  }

  // Post içerik yüklendikten sonra resimleri bul
  setTimeout(() => {
    const postImages = document.querySelectorAll(".post-container img");
    images = Array.from(postImages);

    images.forEach((img, i) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openLightbox(i));
    });
  }, 500);

  // Buton olayları
  rightBtn.addEventListener("click", showNext);
  leftBtn.addEventListener("click", showPrev);
  closeBtn.addEventListener("click", closeLightbox);

  // ESC ile kapatma
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  // Lightbox boş alana tıklayınca kapanır
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
});
// Kod bloklarına copy butonu ekle
function addCopyButtons() {
  const codeBlocks = document.querySelectorAll('.post-container pre code');

  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentNode;

    // Zaten copy varsa ekleme
    if(pre.querySelector('.copy-btn')) return;

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.className = 'copy-btn';
    copyBtn.style.cssText = 'position:absolute;top:5px;right:5px;padding:5px 10px;cursor:pointer;background:#4CAF50;color:white;border:none;border-radius:5px;';
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1500);
      });
    });

    // Pre’nin üstüne butonu ekle
    pre.style.position = 'relative';
    pre.insertBefore(copyBtn, pre.firstChild);
  });
}

// Post yüklendikten sonra çağır
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(addCopyButtons, 500); // JSON yüklenip innerHTML eklenince çalışsın
});
