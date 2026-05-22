// MHM Bakery — Cart System
const cart = {
  items: JSON.parse(localStorage.getItem('mhm_cart') || '[]'),

  save() {
    localStorage.setItem('mhm_cart', JSON.stringify(this.items));
  },

  add(name, price) {
    const existing = this.items.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ name, price, qty: 1 });
    }
    this.save();
    this.render();
    this.updateCount();
    showToast(`🛒 ${name} added to cart!`);
  },

  remove(name) {
    this.items = this.items.filter(i => i.name !== name);
    this.save();
    this.render();
    this.updateCount();
  },

  changeQty(name, delta) {
    const item = this.items.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(name);
      return;
    }
    this.save();
    this.render();
    this.updateCount();
  },

  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  updateCount() {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = this.count();
      el.style.display = this.count() === 0 ? 'none' : 'inline-flex';
    });
  },

  render() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <span>🛒</span>
          <p>Your cart is empty</p>
        </div>`;
      document.getElementById('cart-total-amount').textContent = 'PKR 0';
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="cart.changeQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="cart.changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="cart.remove('${item.name.replace(/'/g, "\\'")}')">✕</button>
      </div>
    `).join('');

    document.getElementById('cart-total-amount').textContent =
      'PKR ' + this.total().toLocaleString();
  }
};

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  cart.render();
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Attach add-to-cart to all buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCount();

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.product-card, .special-card');
      const name = card.querySelector('h3').textContent.trim();
      const priceText = card.querySelector('.price').textContent.trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      cart.add(name, price);

      // Brief "Added!" feedback
      const original = this.textContent;
      this.textContent = '✓ Added!';
      this.classList.add('added');
      setTimeout(() => {
        this.textContent = original;
        this.classList.remove('added');
      }, 1200);
    });
  });

  // Close sidebar on overlay click
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
});
