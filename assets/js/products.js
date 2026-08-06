/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Products Engine
   Ladies Suits only — with image gallery
═══════════════════════════════════════ */

const WHATSAPP_NUMBER = "923076064194";

let allProducts = [];
let activeFilter = "all";
let searchQuery  = "";
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

/* ── WhatsApp order link ── */
function waOrderLink(product, designNum) {
  const designText = designNum ? ` (Design #${designNum})` : "";
  const msg = encodeURIComponent(
    `Assalamu Alaikum! I want to order:\n\n` +
    `*${product.name}*${designText}\n` +
    `Price: Rs. ${product.price.toLocaleString()}\n` +
    `Fabric: ${product.fabric}\n\n` +
    `Please confirm availability and delivery. Shukriya!`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

/* ═══════════════════════════════════════
   IMAGE GALLERY — shows all designs
   with prev/next arrows on each card
═══════════════════════════════════════ */
function renderCard(p) {
  const disc     = getDiscount(p.price, p.originalPrice);
  const inStock  = p.available;
  const images   = p.images && p.images.length ? p.images : [p.image];
  const total    = images.length;
  const cardId   = p.id.replace(/[^a-z0-9]/gi, "");

  // Build image slides
  const slides = images.map((img, i) => `
    <div class="slide" style="display:${i===0?'block':'none'};width:100%;height:100%;position:absolute;top:0;left:0">
      <img src="${img}" alt="${p.name} design ${i+1}" loading="lazy"
        data-base="${img.replace(/\.(jpg|jpeg|png|webp|avif)$/i,'')}"
        data-formats='["jpeg","jpg","png","webp"]'
        data-fmt-index="0"
        onerror="tryNextFormat(this)"
        style="width:100%;height:100%;object-fit:cover">
    </div>`).join("");

  const orderBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-order" id="obtn-${cardId}" onclick="trackOrder('${p.id}')">Order Now</a>`
    : `<button class="btn-order disabled" disabled>Out of Stock</button>`;

  const waBtn = inStock
    ? `<a href="${waOrderLink(p)}" target="_blank" class="btn-wa" id="wbtn-${cardId}" title="WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
       </a>`
    : "";

  return `
    <div class="product-card${inStock ? "" : " stockout"}" data-id="${p.id}" data-category="${p.category}">
      <div class="product-img-wrap" style="position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--cream-deep)">
        ${slides}

        <!-- Discount badge top-left -->
        <span class="discount-ribbon">${disc}% OFF</span>

        <!-- Design counter top-right -->
        <span style="position:absolute;top:10px;right:10px;background:rgba(26,22,18,.65);color:white;font-size:10px;font-weight:500;padding:3px 8px;border-radius:20px;z-index:3" id="counter-${cardId}">1 / ${total}</span>

        <!-- Prev arrow -->
        ${total > 1 ? `
        <button onclick="slideImg('${cardId}','${p.id}',-1,${total},event)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:4;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.85);border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)">‹</button>
        <button onclick="slideImg('${cardId}','${p.id}',1,${total},event)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:4;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.85);border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)">›</button>
        ` : ""}

        <!-- Stock badge bottom-left -->
        <span class="stock-badge ${inStock ? "in-stock" : "stockout"}">${inStock ? "✓ Available" : "✕ Out of Stock"}</span>
      </div>

      <div class="product-body">
        <div class="product-category">Ladies Suits</div>
        <div class="product-name">${p.name}</div>
        <div class="product-fabric">Fabric: ${p.fabric}</div>
        <div style="font-size:12px;color:var(--gold);margin-bottom:10px;font-weight:500">
          ${total} Designs Available — swipe to browse ›
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

/* ── Slide between designs ── */
const slideState = {};

function slideImg(cardId, productId, dir, total, e) {
  e.preventDefault();
  e.stopPropagation();

  if (!slideState[cardId]) slideState[cardId] = 0;
  slideState[cardId] = (slideState[cardId] + dir + total) % total;
  const idx = slideState[cardId];

  const card = document.querySelector(`[data-id="${productId}"] .product-img-wrap`);
  if (!card) return;

  card.querySelectorAll(".slide").forEach((s, i) => {
    s.style.display = i === idx ? "block" : "none";
  });

  // Update counter
  const counter = document.getElementById(`counter-${cardId}`);
  if (counter) counter.textContent = `${idx + 1} / ${total}`;

  // Update WhatsApp link with design number
  const obtn = document.getElementById(`obtn-${cardId}`);
  const wbtn = document.getElementById(`wbtn-${cardId}`);
  const product = allProducts.find(p => p.id === productId);
  if (product && inStock(product)) {
    const link = waOrderLink(product, idx + 1);
    if (obtn) obtn.href = link;
    if (wbtn) wbtn.href = link;
  }
}

function inStock(p) { return p.available; }

/* ── tryNextFormat for image fallback ── */
function tryNextFormat(img) {
  try {
    const formats = JSON.parse(img.getAttribute("data-formats"));
    let idx = parseInt(img.getAttribute("data-fmt-index")) + 1;
    if (idx < formats.length) {
      img.setAttribute("data-fmt-index", idx);
      img.src = img.getAttribute("data-base") + "." + formats[idx];
    } else {
      img.parentNode.style.background = "var(--cream-deep)";
      img.style.display = "none";
    }
  } catch(e) { img.style.display = "none"; }
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

/* ── Featured (homepage — all 4) ── */
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
  renderProducts(filtered);
  updateCount(filtered.length);
}

function updateCount(n) {
  const el = document.getElementById("product-count");
  if (el) el.textContent = `${n} collection${n !== 1 ? "s" : ""}`;
}

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
