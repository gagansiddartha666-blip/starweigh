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
