// Shared JS for navigation, mobile toggle, smooth scroll and product modal

// ---------------------- NAV / MOBILE TOGGLE ----------------------
// Toggle mobile sidebar: call toggleNav() or toggleNav(false) to close
// Toggle mobile sidebar: call toggleNav() or toggleNav(false) to close
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
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({ behavior: 'smooth' });
      }
      const navUl = document.getElementById('main-nav');
      if(navUl && navUl.classList.contains('show')) navUl.classList.remove('show');
      const btn = document.querySelector('.mobile-toggle');
      if(btn) btn.setAttribute('aria-expanded','false');
    });
    setActiveNavLinks()
  });

  // attach contact form handler if present
  const contactForm = document.getElementById('contactForm');
  if(contactForm) {
    contactForm.addEventListener('submit', submitForm);
  }
});

// ---------------------- SCROLL LOCK HELPERS (for modal) ----------------------
let _scrollTop = 0;
function lockScroll() {
  _scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.top = `-${_scrollTop}px`;
  document.body.style.position = 'fixed';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.classList.add('modal-open');
}
function unlockScroll() {
  document.body.classList.remove('modal-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  window.scrollTo(0, _scrollTop);
  _scrollTop = 0;
}

// ---------------------- CONTACT FORM SUBMIT (Web3Forms AJAX with mailto fallback) ----------------------
/*
 Replace YOUR_WEB3FORMS_ACCESS_KEY with the actual key you get from https://web3forms.com
 If you don't replace it, the script will fallback to opening mailto: like before.
*/
const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';

async function submitForm(e) {
  if(e && e.preventDefault) e.preventDefault();

  const name = document.getElementById('name')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const message = document.getElementById('message')?.value?.trim();

  if(!name || !email || !message) {
    // inline UI could be used instead of alert; keeping alert for backwards compatibility
    alert('Please fill required fields');
    return;
  }

  // If user replaced the access key, use Web3Forms AJAX
  if(WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
    try {
      // build form data
      const fd = new FormData();
      fd.append('access_key', WEB3FORMS_ACCESS_KEY);
      fd.append('name', name);
      fd.append('email', email);
      fd.append('message', message);
      fd.append('subject', 'New enquiry from Star Weigh website');

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: fd
      });

      const json = await res.json();
      // check response
      const statusEl = document.getElementById('formStatus');
      if(json && json.success) {
        if(statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#0b8a4a'; // green
          statusEl.textContent = '✔ Message sent successfully!';
        } else {
          alert('Message sent successfully!');
        }
        // reset form
        const form = document.getElementById('contactForm');
        if(form) form.reset();
      } else {
        // show error
        if(statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#c62828';
          statusEl.textContent = '✖ Failed to send. Please try again later.';
        } else {
          alert('Failed to send. Please try again later.');
        }
        console.error('Web3Forms error:', json);
      }
    } catch (err) {
      const statusEl = document.getElementById('formStatus');
      if(statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = '#c62828';
        statusEl.textContent = '✖ Failed to send. Please try again later.';
      } else {
        alert('Failed to send. Please try again later.');
      }
      console.error('Submit error:', err);
    }
    return;
  }

  // Fallback behavior: open mail client using mailto (legacy)
  const subject = encodeURIComponent('Contact from website: ' + name);
  const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
  window.location.href = `mailto:starinstruments1@gmail.com?subject=${subject}&body=${body}`;
}

// ---------------------- PRODUCT GALLERY / MODAL ----------------------
/* single set of variables for gallery */
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
  const titleEl = document.getElementById('modalTitle');
  const subtitleEl = document.getElementById('modalSubtitle');
  const descEl = document.getElementById('modalDescription');
  const featuresList = document.getElementById('modalFeatures');

  if(titleEl) titleEl.textContent = data.title || 'Product';
  if(subtitleEl) subtitleEl.textContent = data.subtitle || '';
  if(descEl) descEl.textContent = data.description || '';

  if(featuresList) {
    featuresList.innerHTML = '';
    if(Array.isArray(data.features)) {
      data.features.forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        featuresList.appendChild(li);
      });
    }
  }

  // show images in modal
  updateModalImage();

  // build thumbnails
  renderThumbnails();

  // show/hide arrows depending on length (guard elements may not exist)
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if(prevBtn) prevBtn.style.display = (galleryImages.length > 1) ? 'block' : 'none';
  if(nextBtn) nextBtn.style.display = (galleryImages.length > 1) ? 'block' : 'none';

  // open modal and lock scroll
  const modal = document.getElementById('productModal');
  if(modal) {
    modal.classList.add('open');
    lockScroll();
  }
}

function updateModalImage() {
  const imgEl = document.getElementById('modalImage');
  if(!imgEl) return;
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
  if(!thumbs) return;
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
  const m = document.getElementById('productModal');
  if(m) m.classList.remove('open');

  // cleanup: stop images or videos if present, clear thumbs
  const imgEl = document.getElementById('modalImage');
  if(imgEl) { imgEl.src = ''; imgEl.alt = ''; }
  const thumbs = document.getElementById('thumbs');
  if(thumbs) thumbs.innerHTML = '';

  // unlock scroll (restore page scroll position)
  unlockScroll();
}

// close on ESC
window.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeModal();
});
