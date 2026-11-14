/**
 * NARKK Shopify Theme — cart.js
 * Handles: Cart Drawer open/close, Add to Cart AJAX, Update qty, Remove item
 */

/* ─── CART DRAWER TOGGLE ─── */
function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const btn    = document.getElementById('cartBtn');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const btn    = document.getElementById('cartBtn');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const cartBtn   = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const drawerCartBtn = document.getElementById('drawerCartBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (drawerCartBtn) drawerCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    openCart();
  });
});

/* ─── ADD TO CART (AJAX) ─── */
async function addToCart(variantId, quantity = 1) {
  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    });

    if (!res.ok) throw new Error('Add to cart failed');

    // Refresh cart drawer
    await refreshCart();

    // Animate badge
    const badge = document.getElementById('cartCount');
    if (badge) {
      badge.classList.remove('bounce');
      void badge.offsetWidth; // reflow
      badge.classList.add('bounce');
    }

    // Pulse button
    const atcBtn = document.getElementById('pdpATC');
    if (atcBtn) {
      atcBtn.classList.add('added');
      atcBtn.textContent = 'Added!';
      setTimeout(() => {
        atcBtn.classList.remove('added');
        atcBtn.textContent = 'Add to Cart';
      }, 1500);
    }

    openCart();
  } catch (err) {
    console.error('Add to cart error:', err);
  }
}

/* ─── REFRESH CART DRAWER ─── */
async function refreshCart() {
  try {
    const res  = await fetch('/cart.js');
    const cart = await res.json();

    // Update badge count
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = cart.item_count;

    // Update subtotal
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    // Re-render items
    renderCartItems(cart);
  } catch (err) {
    console.error('Refresh cart error:', err);
  }
}

/* ─── UPDATE CART ITEM QTY ─── */
async function updateCartItem(line, quantity) {
  try {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line, quantity })
    });
    
    if (!res.ok) {
      const errData = await res.json();
      alert(errData.description || "Cannot update quantity");
      return;
    }
    
    if (window.location.pathname === '/cart') {
      window.location.reload();
      return;
    }
    
    await refreshCart();
  } catch (err) {
    console.error('Update cart error:', err);
  }
}

/* ─── REMOVE CART ITEM ─── */
async function removeCartItem(line) {
  await updateCartItem(line, 0);
}

/* ─── RENDER CART ITEMS ─── */
function renderCartItems(cart) {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.item_count === 0) {
    if (footer) footer.style.display = 'none';
    container.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <a href="/collections" class="cart-shop-link">Start Shopping</a>
      </div>
    `;
    return;
  }

  if (footer) footer.style.display = '';

  container.innerHTML = cart.items.map((item, idx) => `
    <div class="cart-item" data-line="${idx + 1}">
      <a href="${item.url}" class="cart-item-img">
        <img src="${item.image}" alt="${item.title}" width="80" height="80" loading="lazy">
      </a>
      <div class="cart-item-info">
        <a href="${item.url}" class="cart-item-title">${item.title}</a>
        ${item.variant_title && item.variant_title !== 'Default Title' ? `<div class="cart-item-variant">${item.variant_title}</div>` : ''}
        <div class="cart-item-price">${formatMoney(item.final_price)}</div>
        <div class="cart-item-qty-row">
          <button class="cart-qty-btn" onclick="updateCartItem(${idx + 1}, ${item.quantity - 1})" aria-label="Decrease">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="updateCartItem(${idx + 1}, ${item.quantity + 1})" aria-label="Increase">+</button>
          <button class="cart-item-remove" onclick="removeCartItem(${idx + 1})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── FORMAT MONEY ─── */
function formatMoney(cents) {
  return '₹' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ─── FORM SUBMIT (PDP add to cart) ─── */
document.addEventListener('DOMContentLoaded', () => {
  const pdpForm = document.getElementById('pdpForm');
  if (pdpForm) {
    pdpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const variantId = document.getElementById('variantId').value;
      const quantity  = parseInt(document.getElementById('pdpQty').value) || 1;
      await addToCart(variantId, quantity);
    });
  }
});
