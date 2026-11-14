/**
 * NARKK Shopify Theme — global.js
 * Handles: Mobile Drawer, Video Modal, Sticky Nav, Animations, Variant Selection, Image Switcher
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── MOBILE DRAWER ─── */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  let scrollLockY = 0;

  function lockScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, scrollLockY);
  }

  function openDrawer() {
    mobileDrawer.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    var header = document.getElementById('site-header');
    var panel = mobileDrawer.querySelector('.drawer-panel');
    if (header && panel) {
      panel.style.top = header.getBoundingClientRect().bottom + 'px';
    }
    lockScroll();
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    unlockScroll();
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => {
    if (mobileDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeVideoModal();
      closeCart();
    }
  });

  /* Close drawer on resize to desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ─── VIDEO MODAL ─── */
  const videoModal  = document.getElementById('videoModal');
  const videoClose  = document.getElementById('videoClose');
  const videoTriggers = document.querySelectorAll('[data-video-trigger]');

  function openVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  videoTriggers.forEach(btn => btn.addEventListener('click', openVideoModal));
  if (videoClose) videoClose.addEventListener('click', closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  /* ─── STICKY HEADER SHADOW ─── */
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        siteHeader.style.boxShadow = '0 2px 12px rgba(51,65,85,0.06)';
      } else {
        siteHeader.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  /* ─── INTERSECTION OBSERVER — Section Animations ─── */
  const animEls = document.querySelectorAll('.js-anim');
  if (animEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => observer.observe(el));
  }

  /* ─── PRODUCT IMAGE SWITCHER (PDP) ─── */
  window.switchImage = function(url) {
    const mainImg = document.getElementById('mainProductImage');
    if (!mainImg) return;
    mainImg.src = url;

    // Update active thumb
    document.querySelectorAll('.pdp-thumb').forEach(thumb => {
      thumb.classList.remove('active');
      if (thumb.querySelector('img') && thumb.querySelector('img').src.includes(url.split('?')[0].split('/').pop().split('_')[0])) {
        thumb.classList.add('active');
      }
    });
  };

  /* ─── QUANTITY CONTROLS (PDP) ─── */
  window.changeQty = function(delta) {
    const input = document.getElementById('pdpQty');
    if (!input) return;
    const newVal = Math.max(1, parseInt(input.value || 1) + delta);
    input.value = newVal;
  };

  /* ─── VARIANT SELECTOR (PDP) ─── */
  const variantBtns = document.querySelectorAll('.pdp-option-btn');
  variantBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.pdp-option-group');
      group.querySelectorAll('.pdp-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateVariant();
    });
  });

  function updateVariant() {
    // Collect selected options
    const selectedOptions = [];
    document.querySelectorAll('.pdp-option-group').forEach(group => {
      const selected = group.querySelector('.pdp-option-btn.selected');
      if (selected) selectedOptions.push(selected.dataset.value);
    });
    // Match variant from window.productVariants (set in product template)
    if (!window.productVariants) return;
    const matched = window.productVariants.find(v =>
      selectedOptions.every(opt => v.options.includes(opt))
    );
    if (matched) {
      document.getElementById('variantId').value = matched.id;
      const priceEl = document.getElementById('pdpPrice');
      if (priceEl) priceEl.innerHTML = formatMoney(matched.price);
    }
  }

  function formatMoney(cents) {
    return '₹' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ─── FILTER PILLS (Shop page) ─── */
  document.querySelectorAll('.sp-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      pill.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.sp-pill.open').forEach(p => p.classList.remove('open'));
  });

  /* ─── NOTIFY EMAIL (Coming soon tiles) ─── */
  document.querySelectorAll('.hp-col-notify button, .sp-col-notify2 button').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.value && input.value.includes('@')) {
        btn.textContent = '✓';
        btn.style.background = '#4A9B8E';
        btn.style.color = 'white';
        input.value = '';
        setTimeout(() => {
          btn.textContent = 'Notify';
          btn.style.background = '';
          btn.style.color = '';
        }, 3000);
      }
    });
  });

  /* ─── WISHLIST TOGGLE ─── */
  window.toggleWishlist = function(btn, productId) {
    btn.classList.toggle('active');
    // For a real wishlist, you would trigger an API call here.
    // We are just visually toggling it for now.
  };

  /* ─── BOARD/ACCESSORY PDP — Variant Selector ─── */
  window.selectVariant = function(btn, variantId, priceFormatted, title, priceCents, imgUrl) {
    // Update hidden variant ID
    const varInput = document.getElementById('variant-id');
    if (varInput) varInput.value = variantId;

    // Update price displays
    const priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = priceFormatted;

    const btnPriceEl = document.getElementById('btn-price');
    if (btnPriceEl) btnPriceEl.textContent = priceFormatted;

    // Update size label
    const lbl = document.getElementById('selected-size-label');
    if (lbl) lbl.textContent = title.toUpperCase();

    // Highlight selected button
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // ── Switch gallery to variant image
    if (imgUrl) {
      const mainImg = document.getElementById('main-product-image');
      if (mainImg) mainImg.src = imgUrl;
      // Sync thumbnail highlight
      document.querySelectorAll('.thumb').forEach(t => {
        const tImg = t.dataset.imgUrl || '';
        t.classList.toggle('active', tImg === imgUrl);
      });
    }

    // ── Update per-variant spec bar (dimensions + slot count)
    const dimEl   = document.getElementById('varDim');
    const slotsEl = document.getElementById('varSlots');
    if (dimEl   && btn.dataset.dim)   dimEl.textContent   = btn.dataset.dim;
    if (slotsEl && btn.dataset.slots) slotsEl.textContent = btn.dataset.slots;

    // Legacy spec label support
    const specLbl = document.getElementById('size-spec-label');
    if (specLbl && btn.dataset.spec) specLbl.textContent = btn.dataset.spec;
  };

  /* ─── BOARD/ACCESSORY PDP — Quantity Stepper ─── */
  window.updateQty = function(delta) {
    const input = document.getElementById('quantity-input');
    if (!input) return;
    const newVal = Math.max(1, parseInt(input.value || 1) + delta);
    input.value = newVal;
  };

  /* ─── BOARD PDP — Image Gallery Switcher ─── */
  window.switchImage = function(thumbEl, newSrc) {
    const mainImg = document.getElementById('main-product-image');
    if (mainImg) mainImg.src = newSrc;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  };

  /* ─── ACCESSORY PDP — ADD to bundle bar ─── */
  window.toggleAcc = function(btn, productId, price, name) {
    btn.classList.toggle('on');
    const isOn = btn.classList.contains('on');
    btn.textContent = isOn ? 'Added' : 'Add';

    // Update sticky bar subtotal
    updateAccBar();
  };

  function updateAccBar() {
    const addedBtns = document.querySelectorAll('.acc-btn.on');
    const countEl = document.getElementById('acc-bar-count');
    const priceEl = document.getElementById('acc-bar-price');

    let total = 0;
    addedBtns.forEach(b => {
      const p = parseInt(b.dataset.price || 0);
      total += p;
    });

    if (countEl) countEl.textContent = addedBtns.length;
    if (priceEl) priceEl.textContent = '₹' + (total / 100).toLocaleString('en-IN');
  }

});


window.renderCartDrawer = function(cart) {
  function formatMoney(cents) {
    return '₹' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  var cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  
  if (cart.item_count === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="/collections/tulai" class="cart-shop-link">Start Shopping</a></div>';
    var oldFtr = document.querySelector('.cart-drawer-ftr');
    if (oldFtr) oldFtr.remove();
  } else {
    var html = '';
    cart.items.forEach(function(item, i) {
      var line = i + 1;
      html += '<div class="cart-item" data-line="' + line + '">';
      html += '  <a href="' + item.url + '" class="cart-item-img">';
      if (item.image) {
        html += '    <img src="' + item.image + '&width=120" alt="' + item.title + '" width="80" height="80" loading="lazy">';
      }
      html += '  </a>';
      html += '  <div class="cart-item-info">';
      html += '    <a href="' + item.url + '" class="cart-item-title">' + item.product_title + '</a>';
      if (item.variant_title && item.variant_title !== 'Default Title') {
        html += '    <div class="cart-item-variant">' + item.variant_title + '</div>';
      }
      html += '    <div class="cart-item-price">' + formatMoney(item.final_price) + '</div>';
      html += '    <div class="cart-item-qty-row">';
      html += '      <button class="cart-qty-btn" onclick="updateCartItem(' + line + ', ' + (item.quantity - 1) + ')" aria-label="Decrease quantity">−</button>';
      html += '      <span class="cart-item-qty">' + item.quantity + '</span>';
      html += '      <button class="cart-qty-btn" onclick="updateCartItem(' + line + ', ' + (item.quantity + 1) + ')" aria-label="Increase quantity">+</button>';
      html += '      <button class="cart-item-remove" onclick="updateCartItem(' + line + ', 0)" aria-label="Remove ' + item.title + '">Remove</button>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
    });
    cartItems.innerHTML = html;
    
    var panel = document.querySelector('.cart-drawer-panel');
    var ftr = document.querySelector('.cart-drawer-ftr');
    if (!ftr) {
      ftr = document.createElement('div');
      ftr.className = 'cart-drawer-ftr';
      panel.appendChild(ftr);
    }
    ftr.innerHTML = '<div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">' + formatMoney(cart.total_price) + '</span></div><p class="cart-tax-note">Taxes and shipping calculated at checkout</p><a href="/checkout" class="cart-checkout-btn">Proceed to Checkout</a><a href="/cart" class="cart-view-btn">View Full Cart</a>';
  }
  
  var badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = cart.item_count;
  }
  
  var cartDrawer = document.getElementById('cartDrawer');
  var cartOverlay = document.getElementById('cartOverlay');
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('show');
  }
};

window.quickAddProduct = function(btn, variantId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  var oldText = btn.innerText;
  btn.innerText = 'Adding...';
  
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity: 1 }] })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    btn.classList.add('added');
    btn.innerText = 'Added';
    
    // Refresh the Cart Drawer seamlessly
    fetch('/cart.js')
      .then(function(res) { return res.json(); })
      .then(function(cart) {
        window.renderCartDrawer(cart);
        
        // Reset button after a delay
        setTimeout(function() {
          btn.classList.remove('added');
          btn.innerText = oldText;
        }, 2000);
      });
  })
  .catch(function(e) {
    btn.innerText = 'Error';
    setTimeout(function() { btn.innerText = oldText; }, 2000);
  });
};

window.updateCartItem = function(line, quantity) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line: line, quantity: quantity })
  })
  .then(function(r) { return r.json(); })
  .then(function(cart) {
    window.renderCartDrawer(cart);
  });
};


// Manifesto scroll animation
function initManifestoScroll() {
  const track = document.querySelector('.mani-scroll-track');
  if (!track) return;
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    const rect = track.closest('.mani-scroll-section').getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const maxShift = track.scrollWidth - track.parentElement.offsetWidth;
      track.style.transform = 'translateX(-' + Math.min(maxShift, Math.max(0, progress * maxShift)) + 'px)';
      track.querySelectorAll('.mani-scroll-item').forEach(function(item, i) {
        item.classList.toggle('active', Math.abs(progress - (i / track.children.length)) < 0.1);
      });
    }
  }, { passive: true });
}
document.addEventListener('DOMContentLoaded', initManifestoScroll);

