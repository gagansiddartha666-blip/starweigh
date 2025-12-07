// Shared JS for navigation, mobile toggle, smooth scroll and product modal
// ===== mark current nav item based on current location =====
function setActiveNavLinks() {
  try {
    const links = document.querySelectorAll('nav a');
    if(!links || links.length === 0) return;
    // compute normalized current path (no trailing slash)
    const curPath = location.pathname.replace(/\/+$/, '') || '/';

    links.forEach(a => {
      // remove previous markers
      a.classList.remove('is-current');
      a.removeAttribute('aria-current');

      const href = a.getAttribute('href');
      if(!href || href === '#') return;

      // create an absolute URL based on the anchor href
      const url = new URL(href, location.origin + location.pathname);
      const linkPath = url.pathname.replace(/\/+$/, '') || '/';

      // match logic:
      // 1) exact pathname match
      // 2) if linkPath is not root, check if current path endsWith linkPath (e.g., /products/index.html matches /products)
      const isMatch = (linkPath === curPath) || (linkPath !== '/' && curPath.endsWith(linkPath));

      if(isMatch) {
        a.classList.add('is-current');
        a.setAttribute('aria-current','page');
        const li = a.closest('li');
        if(li) li.classList.add('is-current');
      } else {
        const li = a.closest('li');
        if(li) li.classList.remove('is-current');
      }
    });
  } catch(e) {
    // fail silently
    console.error('setActiveNavLinks error', e);
  }
}

// Toggle mobile sidebar: call toggleNav() or toggleNav(false) to close
// Toggle mobile sidebar: call toggleNav() or toggleNav(false) to close
function toggleNav(forceOpen) {
  // ensure elements exist
  const nav = document.querySelector('nav');
  const overlay = document.getElementById('navOverlay');
  const btn = document.querySelector('.mobile-toggle');

  if(!nav) return;

  // If we haven't already moved the nav into an offcanvas wrapper, do it once
  if(!document.querySelector('.offcanvas-nav')) {
    // create wrapper
    const off = document.createElement('div');
    off.className = 'offcanvas-nav';
    // move current nav content (clone) into offcanvas wrapper
    off.appendChild(nav.cloneNode(true));
    // insert wrapper into DOM just after header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(off, header.nextSibling);
    // ensure links in the cloned nav close the sidebar when clicked
    off.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleNav(false)));
  }

  const isOpen = document.body.classList.contains('sidebar-open');
  const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !isOpen;

  if(shouldOpen) {
    document.body.classList.add('sidebar-open');
    if(btn) btn.setAttribute('aria-expanded','true');
    if(overlay) overlay.setAttribute('aria-hidden','false');

    // focus the offcanvas container (not the first link) to avoid a single menu item showing as selected
    const offEl = document.querySelector('.offcanvas-nav');
    if(offEl) {
      offEl.setAttribute('tabindex', '-1'); // make it focusable programmatically
      offEl.focus({ preventScroll: true });
    }

    // ensure the correct nav item is highlighted when sidebar opens
    setActiveNavLinks();
  } else {
    document.body.classList.remove('sidebar-open');
    if(btn) btn.setAttribute('aria-expanded','false');
    if(overlay) overlay.setAttribute('aria-hidden','true');
    // return focus to toggle
    if(btn) btn.focus();
  }
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
   setActiveNavLinks();
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
