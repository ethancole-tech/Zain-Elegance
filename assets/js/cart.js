/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Cart System
   WhatsApp-based checkout
═══════════════════════════════════════ */

const WA_NUMBER = "923XXXXXXXXX"; // ← YOUR NUMBER HERE

let cart = [];

/* ── Load cart ── */
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem("ze_cart") || "[]"); }
  catch(e) { cart = []; }
}

function saveCart() {
  localStorage.setItem("ze_cart", JSON.stringify(cart));
  updateCartCount();
}

/* ── Add to cart ── */
function addToCart(product, size = "") {
  const existing = cart.find(i => i.id === product.id && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1, size });
  }
  saveCart();
  showCartToast(product.name);
}

/* ── Remove from cart ── */
function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
  renderCartPage();
}

/* ── Update qty ── */
function updateQty(id, size, qty) {
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart();
    renderCartPage();
  }
}

/* ── Cart count badge ── */
function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? "flex" : "none";
  });
}

/* ── Toast notification ── */
function showCartToast(name) {
  let toast = document.getElementById("cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cart-toast";
    toast.style.cssText = `
      position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
      background:var(--ink);color:var(--cream);padding:12px 20px;
      border-radius:24px;font-size:13px;z-index:2000;
      box-shadow:0 4px 20px rgba(0,0,0,.2);
      transition:opacity .3s;white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ "${name}" added to cart`;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.style.opacity = "0", 2500);
}

/* ── Cart total ── */
function cartTotal() {
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

/* ── Render cart page ── */
function renderCartPage() {
  const container = document.getElementById("cart-items");
  const summary   = document.getElementById("cart-summary");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:var(--warm-mid)">
        <div style="font-family:var(--font-display);font-size:32px;margin-bottom:12px">Your cart is empty</div>
        <p style="font-size:15px;margin-bottom:24px">Browse our premium collection and add items you love</p>
        <a href="shop.html" class="btn-primary" style="display:inline-flex">Shop Now →</a>
      </div>`;
    if (summary) summary.style.display = "none";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" style="display:flex;gap:16px;padding:20px 0;border-bottom:1px solid var(--cream-deep);align-items:center">
      <div style="width:80px;height:100px;border-radius:8px;background:var(--cream-deep);overflow:hidden;flex-shrink:0">
        <img src="${item.image || ""}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
      </div>
      <div style="flex:1">
        <div style="font-family:var(--font-display);font-size:18px;color:var(--ink)">${item.name}</div>
        ${item.size ? `<div style="font-size:12px;color:var(--warm-mid);margin-top:2px">Size: ${item.size}</div>` : ""}
        <div style="font-size:13px;color:var(--warm-mid);margin-top:2px">${item.fabric}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <button onclick="updateQty('${item.id}','${item.size}',${item.qty-1})" style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--cream-deep);background:white;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer">−</button>
            <span style="font-size:14px;font-weight:500;min-width:20px;text-align:center">${item.qty}</span>
            <button onclick="updateQty('${item.id}','${item.size}',${item.qty+1})" style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--cream-deep);background:white;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer">+</button>
          </div>
          <button onclick="removeFromCart('${item.id}','${item.size}')" style="font-size:12px;color:var(--red-sale);cursor:pointer;background:none;border:none;font-family:inherit">Remove</button>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:18px;font-weight:600;color:var(--ink)">Rs. ${(item.price * item.qty).toLocaleString()}</div>
        <div style="font-size:12px;color:var(--warm-light);margin-top:2px">Rs. ${item.price.toLocaleString()} each</div>
      </div>
    </div>
  `).join("");

  if (summary) {
    const total = cartTotal();
    const savings = cart.reduce((s, i) => s + ((i.originalPrice - i.price) * i.qty), 0);
    summary.style.display = "block";
    summary.innerHTML = `
      <div style="background:var(--white);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm)">
        <div style="font-family:var(--font-display);font-size:22px;margin-bottom:20px;color:var(--ink)">Order Summary</div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--ink-soft);margin-bottom:10px">
          <span>Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} items)</span>
          <span>Rs. ${total.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--green-stock);margin-bottom:10px">
          <span>You save</span>
          <span>Rs. ${savings.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--ink-soft);margin-bottom:20px">
          <span>Delivery</span>
          <span style="color:var(--green-stock)">Free across Pakistan</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:600;color:var(--ink);padding-top:16px;border-top:1px solid var(--cream-deep);margin-bottom:20px">
          <span>Total</span>
          <span>Rs. ${total.toLocaleString()}</span>
        </div>
        <a href="${buildWhatsAppOrder()}" target="_blank" 
           style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#25D366;color:white;border-radius:var(--radius);font-size:15px;font-weight:500;text-decoration:none;transition:opacity .2s"
           onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
          Complete Order on WhatsApp
        </a>
        <div style="text-align:center;font-size:12px;color:var(--warm-mid);margin-top:12px">
          🔒 Secure · Fast Delivery · Easy Returns
        </div>
      </div>`;
  }
}

/* ── Build WhatsApp order message ── */
function buildWhatsAppOrder() {
  const lines = cart.map(i =>
    `• ${i.name}${i.size ? " ("+i.size+")" : ""} × ${i.qty} = Rs. ${(i.price*i.qty).toLocaleString()}`
  );
  const total = cartTotal();
  const msg = encodeURIComponent(
    `Assalamu Alaikum! I'd like to place an order from Zain Elegance:\n\n` +
    lines.join("\n") +
    `\n\n*Total: Rs. ${total.toLocaleString()}*\n\nPlease confirm availability and delivery details. JazakAllah Khair!`
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  updateCartCount();
  renderCartPage();
});
