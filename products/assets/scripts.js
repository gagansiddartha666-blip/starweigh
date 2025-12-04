// Shared JS for navigation, mobile toggle, smooth scroll and product modal
function toggleNav(){
  const ul=document.getElementById('main-nav');
  if(!ul) return; const isVisible = ul.classList.contains('show');
  ul.classList.toggle('show',!isVisible);
  const btn=document.querySelector('.mobile-toggle'); if(btn) btn.setAttribute('aria-expanded',String(!isVisible));
}

// Close mobile nav on link click and enable smooth scroll for anchors on same page
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('nav a').forEach(a=>{
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault(); const target=document.querySelector(href); if(target) target.scrollIntoView({behavior:'smooth'});
      }
      const navUl=document.getElementById('main-nav'); if(navUl && navUl.classList.contains('show')) navUl.classList.remove('show');
      const btn=document.querySelector('.mobile-toggle'); if(btn) btn.setAttribute('aria-expanded','false');
    });
  });
});

// Product modal helper (works in products.html)
function openProduct(btn){
  const card = btn.closest('.product-card'); if(!card) return;
  const raw = card.getAttribute('data-product'); let data={};
  try{data = JSON.parse(raw)}catch(e){console.error(e)}
  document.getElementById('modalTitle').innerText = data.title || 'Product';
  document.getElementById('modalSubtitle').innerText = data.subtitle || '';
  document.getElementById('modalDescription').innerText = data.description || '';
  document.getElementById('modalImage').src = data.image || 'images/placeholder.jpg';
  const feat = document.getElementById('modalFeatures'); if(feat){ feat.innerHTML=''; (data.features||[]).forEach(f=>{const li=document.createElement('li');li.innerText=f;feat.appendChild(li)}); }
  document.getElementById('productModal').classList.add('open');
}
function closeModal(){const m=document.getElementById('productModal'); if(m) m.classList.remove('open');}
window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });

// Contact form (client-side mailto fallback)
function submitForm(e){
  if(e) e.preventDefault();
  const name=document.getElementById('name')?.value?.trim();
  const email=document.getElementById('email')?.value?.trim();
  const message=document.getElementById('message')?.value?.trim();
  if(!name||!email||!message){ alert('Please fill required fields'); return }
  const subject=encodeURIComponent('Contact from website: '+name);
  const body=encodeURIComponent('Name: '+name+'\nEmail: '+email+'\n\nMessage:\n'+message);
  window.location.href = `mailto:starinstruments1@gmail.com?subject=${subject}&body=${body}`;
}
/* ===== product gallery script ===== */
let galleryImages = [];
let galleryIndex = 0;

function openProduct(buttonElem) {
  // buttonElem is the <button> inside the .product-card; find the card
  const card = buttonElem.closest('.product-card');
  if(!card) return;

  // parse JSON safely
  let data = {};
  try {
    data = JSON.parse(card.getAttribute('data-product'));
  } catch(e) {
    console.error('Invalid product JSON', e);
    return;
  }

  galleryImages = Array.isArray(data.images) && data.images.length ? data.images.slice() : (data.image ? [data.image] : []);
  galleryIndex = 0;

  // populate modal text
  document.getElementById('modalTitle').textContent = data.title || 'Product';
  document.getElementById('modalSubtitle').textContent = data.subtitle || '';
  document.getElementById('modalDescription').textContent = data.description || '';

  const featuresList = document.getElementById('modalFeatures');
  featuresList.innerHTML = '';
  if(Array.isArray(data.features)) {
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresList.appendChild(li);
    });
  }

  // show images in modal
  updateModalImage();

  // build thumbnails
  renderThumbnails();

  // show/hide arrows depending on length
  document.getElementById('prevBtn').style.display = (galleryImages.length > 1) ? 'block' : 'none';
  document.getElementById('nextBtn').style.display = (galleryImages.length > 1) ? 'block' : 'none';

  // open modal
  document.getElementById('productModal').classList.add('open');
}

function updateModalImage() {
  const imgEl = document.getElementById('modalImage');
  if(!galleryImages || galleryImages.length === 0) {
    imgEl.src = '';
    imgEl.alt = '';
    return;
  }
  imgEl.src = galleryImages[galleryIndex];
  imgEl.alt = 'Product image ' + (galleryIndex + 1);
  // mark active thumb
  const thumbs = document.querySelectorAll('#thumbs img');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === galleryIndex));
}

function nextImage() {
  if(!galleryImages || galleryImages.length <= 1) return;
  galleryIndex = (galleryIndex + 1) % galleryImages.length;
  updateModalImage();
}

function prevImage() {
  if(!galleryImages || galleryImages.length <= 1) return;
  galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
  updateModalImage();
}

function gotoImage(i) {
  if(!galleryImages || i < 0 || i >= galleryImages.length) return;
  galleryIndex = i;
  updateModalImage();
}

function renderThumbnails() {
  const thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = '';
  if(!galleryImages || galleryImages.length === 0) return;
  galleryImages.forEach((src, i) => {
    const t = document.createElement('img');
    t.src = src;
    t.alt = 'Thumb ' + (i+1);
    t.addEventListener('click', () => gotoImage(i));
    if(i === galleryIndex) t.classList.add('active');
    thumbs.appendChild(t);
  });
}

function closeModal() {
  document.getElementById('productModal').classList.remove('open');
}
