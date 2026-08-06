/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Products Engine
   Click card → goes to collection page
═══════════════════════════════════════ */

const WHATSAPP_NUMBER = "923076064194";

let allProducts = [];
let activeFilter = "all";
let sortOrder    = "default";

/* ── Load products ── */
async function loadProducts() {
  try {
    const res = await fetch("data/products.json");
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch(e) { console.error("Could not load products:", e); }
}

/* ── Discount % ── */
function getDiscount(price, original) {
  return Math.round(((original - price) / original) * 100);
}

/* ── WhatsApp link ── */
function waOrderLink(product) {
  const msg = encodeURIComponent(
    `Assalamu Alaikum! I want to order from:\n\n*${product.name}*\nPrice: Rs. ${product.price.toLocaleString()}\nFabric: ${product.fabric}\n\nPlease share available designs. Shukriya!`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

/* ── Render single collection card ── */
function renderCard(p) {
  const disc    = getDiscount(p.price, p.originalPrice);
  const inStock = p.available;
  const images  = p.images && p.images.length ? p.images : [p.image];
  const total   = images.length;

  const orderBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-order" onclick="event.stopPropagation();trackOrder('${p.id}')">Order Now</a>`
    : `<button class="btn-order disabled" disabled>Out of Stock</button>`;

  const waBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-wa" onclick="event.stopPropagation()" title="WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
       </a>`
    : "";

  return `
    <div class="product-card${inStock ? "" : " stockout"}"
         data-id="${p.id}"
         data-category="${p.category}"
         onclick="window.location.href='collection.html?id=${p.id}'"
         style="cursor:pointer">
      <div class="product-img-wrap" style="position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--cream-deep)">
        <img src="${images[0]}" alt="${p.name}"
          data-base="${images[0].replace(/\.(jpg|jpeg|png|webp|avif)$/i,'')}"
          data-formats='["jpeg","jpg","png","webp"]'
          data-fmt-index="0"
          onerror="tryNextFormat(this)"
          style="width:100%;height:100%;object-fit:cover;transition:transform .45s ease">

        <span class="discount-ribbon">${disc}% OFF</span>

        <!-- Design count badge -->
        <span style="position:absolute;bottom:10px;right:10px;background:rgba(184,151,46,.92);color:white;font-size:10px;font-weight:600;padding:4px 10px;border-radius:20px;z-index:3">
          ${total} Designs
        </span>

        <span class="stock-badge ${inStock ? "in-stock" : "stockout"}">${inStock ? "✓ Available" : "✕ Out of Stock"}</span>
      </div>

      <div class="product-body">
        <div class="product-category">Ladies Suits</div>
        <div class="product-name">${p.name}</div>
        <div class="product-fabric">Fabric: ${p.fabric}</div>
        <div style="font-size:12px;color:var(--gold);margin-bottom:10px;font-weight:500">
          👆 Tap to browse all ${total} designs
        </div>
        <div class="product-pricing">
          <span class="price-now">Rs. ${p.price.toLocaleString()}</span>
          <span class="price-was">Rs. ${p.originalPrice.toLocaleString()}</span>
          <span class="price-pct">${disc}% off</span>
        </div>
        <div class="product-actions">
          ${orderBtn}
          ${waBtn}
        </div>
      </div>
    </div>`;
}

/* ── Image fallback ── */
function tryNextFormat(img) {
  try {
    const formats = JSON.parse(img.getAttribute("data-formats"));
    let idx = parseInt(img.getAttribute("data-fmt-index")) + 1;
    if (idx < formats.length) {
      img.setAttribute("data-fmt-index", idx);
      img.src = img.getAttribute("data-base") + "." + formats[idx];
    } else {
      img.parentNode.innerHTML = `<div class="product-img-placeholder"><span class="ph-icon">🪡</span><span class="ph-text">Photo coming soon</span></div>`;
    }
  } catch(e) {}
}

/* ── Render grid ── */
function renderProducts(products) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--warm-mid);font-family:var(--font-display);font-size:22px">No products found</div>`;
    return;
  }
  grid.innerHTML = products.map(renderCard).join("");
}

/* ── Featured homepage ── */
async function loadFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  try {
    const res = await fetch("data/products.json");
    const products = await res.json();
    grid.innerHTML = products.filter(p => p.available).map(renderCard).join("");
  } catch(e) { console.error(e); }
}

/* ── Filters ── */
function applyFilters() {
  let filtered = [...allProducts];
  if (activeFilter !== "all") filtered = filtered.filter(p => p.id === activeFilter);
  if (sortOrder === "price-asc")  filtered.sort((a,b) => a.price - b.price);
  if (sortOrder === "price-desc") filtered.sort((a,b) => b.price - a.price);
  if (sortOrder === "discount")   filtered.sort((a,b) => getDiscount(b.price,b.originalPrice) - getDiscount(a.price,a.originalPrice));
  renderProducts(filtered);
  updateCount(filtered.length);
}

function updateCount(n) {
  const el = document.getElementById("product-count");
  if (el) el.textContent = `${n} collection${n !== 1 ? "s" : ""}`;
}

function initFilters() {
  document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });
  const sortEl = document.getElementById("filter-sort");
  if (sortEl) sortEl.addEventListener("change", e => { sortOrder = e.target.value; applyFilters(); });
}

/* ── Analytics ── */
function trackOrder(id) {
  try {
    const data = JSON.parse(localStorage.getItem("ze_orders") || "{}");
    data[id] = (data[id] || 0) + 1;
    localStorage.setItem("ze_orders", JSON.stringify(data));
  } catch(e) {}
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("products-grid")) loadProducts().then(initFilters);
  if (document.getElementById("featured-grid")) loadFeatured();
});