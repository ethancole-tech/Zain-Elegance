/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Products Engine
   Supports: jpg, jpeg, png, webp, gif, avif
   Just upload any image — it works automatically
═══════════════════════════════════════ */

const WHATSAPP_NUMBER = "923076064194";

let allProducts = [];
let activeFilter = "all";
let searchQuery = "";
let sortOrder = "default";

/* ── Load products ── */
async function loadProducts() {
  try {
    const res = await fetch("data/products.json");
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch(e) {
    console.error("Could not load products:", e);
  }
}

/* ── Discount % ── */
function getDiscount(price, original) {
  return Math.round(((original - price) / original) * 100);
}

/* ── WhatsApp order link ── */
function waOrderLink(product) {
  const msg = encodeURIComponent(
    `Assalamu Alaikum! I want to order:\n\n` +
    `*${product.name}*\n` +
    `Price: Rs. ${product.price.toLocaleString()}\n` +
    `Fabric: ${product.fabric}\n\n` +
    `Please confirm availability and delivery details. Thank you!`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

/* ══════════════════════════════════════
   SMART IMAGE LOADER
   Tries jpg → jpeg → png → webp automatically
   No matter what format you upload, it finds it
══════════════════════════════════════ */
function getImageHTML(p) {
  if (!p.image) {
    return `<div class="product-img-placeholder"><span class="ph-icon">🪡</span><span class="ph-text">Photo coming soon</span></div>`;
  }

  // Strip any existing extension to get the base path
  const basePath = p.image.replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, "");

  // Try formats in order: jpg, jpeg, png, webp
  return `<img
    src="${p.image}"
    alt="${p.name}"
    loading="lazy"
    data-base="${basePath}"
    data-formats='["jpg","jpeg","png","webp","avif"]'
    data-fmt-index="0"
    onerror="tryNextFormat(this)"
    style="width:100%;height:100%;object-fit:cover;transition:transform .45s ease"
  >`;
}

/* ── Called automatically if image fails to load ── */
function tryNextFormat(img) {
  try {
    const formats = JSON.parse(img.getAttribute("data-formats"));
    let idx = parseInt(img.getAttribute("data-fmt-index")) + 1;

    if (idx < formats.length) {
      img.setAttribute("data-fmt-index", idx);
      img.src = img.getAttribute("data-base") + "." + formats[idx];
    } else {
      // All formats failed — show placeholder
      img.parentNode.innerHTML = `<div class="product-img-placeholder"><span class="ph-icon">🪡</span><span class="ph-text">Photo coming soon</span></div>`;
    }
  } catch(e) {
    img.parentNode.innerHTML = `<div class="product-img-placeholder"><span class="ph-icon">🪡</span><span class="ph-text">Photo coming soon</span></div>`;
  }
}

/* ── Render single card ── */
function renderCard(p) {
  const disc    = getDiscount(p.price, p.originalPrice);
  const inStock = p.available;

  const orderBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-order" onclick="trackOrder('${p.id}')">Order Now</a>`
    : `<button class="btn-order disabled" disabled>Out of Stock</button>`;

  const waBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-wa" title="Order on WhatsApp">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
       </a>`
    : "";

  return `
    <div class="product-card${inStock ? "" : " stockout"}" data-id="${p.id}" data-category="${p.category}">
      <div class="product-img-wrap">
        ${getImageHTML(p)}
        <span class="discount-ribbon">${disc}% OFF</span>
        <span class="stock-badge ${inStock ? "in-stock" : "stockout"}">${inStock ? "✓ Available" : "✕ Out of Stock"}</span>
      </div>
      <div class="product-body">
        <div class="product-category">${categoryLabel(p.category)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-fabric">Fabric: ${p.fabric}</div>
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

function categoryLabel(cat) {
  const map = {
    "gents-suits":  "Gents Suits",
    "ladies-suits": "Ladies Suits",
    "bedsheets":    "Bedsheets",
    "sofa-covers":  "Sofa Covers",
    "comforters":   "Comforters"
  };
  return map[cat] || cat;
}

/* ── Render list ── */
function renderProducts(products) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  if (products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--warm-mid);font-family:var(--font-display);font-size:22px">No products found</div>`;
    return;
  }
  grid.innerHTML = products.map(renderCard).join("");
}

/* ── Filter + search + sort ── */
function applyFilters() {
  let filtered = [...allProducts];
  if (activeFilter !== "all") filtered = filtered.filter(p => p.category === activeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (sortOrder === "price-asc")  filtered.sort((a,b) => a.price - b.price);
  if (sortOrder === "price-desc") filtered.sort((a,b) => b.price - a.price);
  if (sortOrder === "discount")   filtered.sort((a,b) => getDiscount(b.price,b.originalPrice) - getDiscount(a.price,a.originalPrice));
  if (sortOrder === "available")  filtered.sort((a,b) => (b.available?1:0) - (a.available?1:0));
  renderProducts(filtered);
  updateCount(filtered.length);
}

function updateCount(n) {
  const el = document.getElementById("product-count");
  if (el) el.textContent = `${n} product${n !== 1 ? "s" : ""}`;
}

/* ── Filter buttons ── */
function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });
  const searchEl = document.getElementById("filter-search");
  if (searchEl) searchEl.addEventListener("input", e => { searchQuery = e.target.value.trim(); applyFilters(); });
  const sortEl = document.getElementById("filter-sort");
  if (sortEl) sortEl.addEventListener("change", e => { sortOrder = e.target.value; applyFilters(); });
}

/* ── Featured (homepage 4 products) ── */
async function loadFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  try {
    const res = await fetch("data/products.json");
    const products = await res.json();
    const featured = products.filter(p => p.available).slice(0, 4);
    grid.innerHTML = featured.map(renderCard).join("");
  } catch(e) { console.error(e); }
}

/* ── Analytics ── */
function trackOrder(id) {
  try {
    const key = "ze_orders";
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    data[id] = (data[id] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("products-grid")) loadProducts().then(initFilters);
  if (document.getElementById("featured-grid")) loadFeatured();
});
