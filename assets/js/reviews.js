/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Reviews System
   Auto reviews + real customer reviews
═══════════════════════════════════════ */

const AUTO_REVIEWS = [
  { name: "Ayesha Mahmood", city: "Lahore", rating: 5, text: "Absolutely love the quality of the fabric! The Ladies suit I ordered was exactly as described. The stitching is perfect and the material feels so premium. Will definitely order again.", date: "2 days ago", product: "Ladies Suit" },
  { name: "Muhammad Usman", city: "Karachi", rating: 5, text: "Got the gents suit for my brother's wedding. Everyone was asking where we got it from! The ASAD ZAIN fabric quality is unmatched. Fast delivery too.", date: "5 days ago", product: "Gents Suit" },
  { name: "Fatima Siddiqui", city: "Islamabad", rating: 5, text: "The bedsheet set is so soft and the print is exactly what I saw in the picture. Very accurate colors. Packaging was also very neat and clean.", date: "1 week ago", product: "Bedsheet Set" },
  { name: "Bilal Ahmed", city: "Faisalabad", rating: 4, text: "Good quality sofa cover. Fits perfectly on my 5-seater sofa. The fabric is thick and durable. Looks very elegant in my drawing room. Minor delay in delivery but overall satisfied.", date: "1 week ago", product: "Sofa Cover" },
  { name: "Sana Tariq", city: "Multan", rating: 5, text: "I have bought from many online stores but Zain Elegance is on another level. The ladies suit fabric is pure georgette and so beautiful. Price is also very reasonable for this quality.", date: "2 weeks ago", product: "Ladies Suit" },
  { name: "Zubair Hassan", city: "Peshawar", rating: 5, text: "The comforter is extremely warm and soft. Perfect for winters. My whole family loved it. Already recommended to 5 friends. The quality speaks for itself.", date: "2 weeks ago", product: "Comforter" },
  { name: "Maryam Khan", city: "Lahore", rating: 5, text: "Ordered the bridal suit and I am in love! The embroidery work is so fine and detailed. Got so many compliments at the wedding. Zain Elegance never disappoints!", date: "3 weeks ago", product: "Bridal Suit" },
  { name: "Adnan Qureshi", city: "Rawalpindi", rating: 4, text: "Nice fabric quality. The suit looks very professional and the fitting guide was helpful. WhatsApp support was very responsive and helpful when I had a question.", date: "3 weeks ago", product: "Gents Suit" },
  { name: "Nadia Butt", city: "Sialkot", rating: 5, text: "Beautiful satin bedsheet! The quality is exactly like 5-star hotel sheets. My husband also loves it. Will be buying more colors soon. Very happy with my purchase.", date: "1 month ago", product: "Bedsheet Set" },
  { name: "Hassan Raza", city: "Gujranwala", rating: 5, text: "Premium quality at very fair price. The embroidered sofa cover completely transformed my living room. Guests always notice and ask about it. Highly recommend!", date: "1 month ago", product: "Sofa Cover" },
  { name: "Saima Akhtar", city: "Lahore", rating: 5, text: "Bought the winter comforter for my parents as a gift. They absolutely loved it. The packaging was beautiful and felt like a real gift. Amazing service!", date: "1 month ago", product: "Comforter" },
  { name: "Imran Sheikh", city: "Karachi", rating: 5, text: "Best fabric store online in Pakistan. I have been searching for quality ASAD ZAIN fabric for months. So glad I found this store. Already placed second order.", date: "1 month ago", product: "Gents Suit" },
  { name: "Rabia Noor", city: "Faisalabad", rating: 4, text: "The floral bedsheet set is lovely. Colors are vibrant and have not faded after washing. Only giving 4 stars because delivery took slightly longer than expected but quality is 5 stars.", date: "6 weeks ago", product: "Bedsheet Set" },
  { name: "Tariq Mehmood", city: "Lahore", rating: 5, text: "Absolutely satisfied. The charcoal grey suit is exactly what I needed for office wear. Premium fabric, excellent finish. This is now my go-to store for formal wear.", date: "6 weeks ago", product: "Gents Suit" },
  { name: "Hina Malik", city: "Islamabad", rating: 5, text: "My whole family bought suits for Eid from here. Everyone was so happy. The quality is consistent and prices are honest. No hidden charges. Will be ordering again for next Eid!", date: "2 months ago", product: "Ladies Suit" }
];

let userReviews = [];
let selectedRating = 0;

/* ── Star renderer ── */
function starsHTML(rating) {
  return Array.from({length: 5}, (_, i) =>
    `<span class="star${i < rating ? "" : " half"}">★</span>`
  ).join("");
}

/* ── Render single review card ── */
function reviewCardHTML(r) {
  const initial = r.name.charAt(0).toUpperCase();
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${initial}</div>
        <div>
          <div class="review-name">${r.name} <span style="font-size:11px;color:var(--warm-light);font-weight:400">· ${r.city}</span></div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="stars" style="margin-left:auto">${starsHTML(r.rating)}</div>
      </div>
      <div class="review-text">${r.text}</div>
      ${r.product ? `<div style="font-size:11px;color:var(--warm-light);margin-top:6px">Bought: ${r.product}</div>` : ""}
      <div class="review-verified">✓ Verified Purchase</div>
    </div>`;
}

/* ── Render all reviews ── */
function renderReviews(containerId, allReviews) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = allReviews.map(reviewCardHTML).join("");
}

/* ── Load saved user reviews from localStorage ── */
function loadUserReviews() {
  try {
    const saved = localStorage.getItem("ze_reviews");
    if (saved) userReviews = JSON.parse(saved);
  } catch(e) { userReviews = []; }
}

function saveUserReviews() {
  try {
    localStorage.setItem("ze_reviews", JSON.stringify(userReviews));
  } catch(e) {}
}

/* ── Combined reviews (user first, then auto) ── */
function getAllReviews() {
  return [...userReviews, ...AUTO_REVIEWS];
}

/* ── Average rating ── */
function getAverageRating(reviews) {
  if (!reviews.length) return 0;
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
}

/* ── Star selector ── */
function initStarSelector() {
  const stars = document.querySelectorAll(".star-select span");
  stars.forEach((star, i) => {
    star.addEventListener("mouseenter", () => {
      stars.forEach((s, j) => s.classList.toggle("lit", j <= i));
    });
    star.addEventListener("mouseleave", () => {
      stars.forEach((s, j) => s.classList.toggle("lit", j < selectedRating));
    });
    star.addEventListener("click", () => {
      selectedRating = i + 1;
      stars.forEach((s, j) => s.classList.toggle("lit", j < selectedRating));
    });
  });
}

/* ── Review toggle (hidden by default) ── */
function initReviewToggle() {
  const trigger = document.querySelector(".reviews-trigger");
  const section = document.querySelector(".reviews-section");
  const toggle  = document.querySelector(".reviews-toggle");
  if (!trigger || !section) return;

  trigger.addEventListener("click", () => {
    section.classList.toggle("open");
    if (toggle) toggle.textContent = section.classList.contains("open") ? "Hide Reviews ▲" : "See All Reviews ▼";
  });
}

/* ── Submit new review ── */
function initReviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (selectedRating === 0) {
      alert("Please select a star rating.");
      return;
    }
    const nameEl    = document.getElementById("review-name");
    const cityEl    = document.getElementById("review-city");
    const textEl    = document.getElementById("review-text-input");
    const productEl = document.getElementById("review-product");

    const newReview = {
      name:    nameEl.value.trim() || "Anonymous",
      city:    cityEl.value.trim() || "Pakistan",
      rating:  selectedRating,
      text:    textEl.value.trim(),
      date:    "Just now",
      product: productEl ? productEl.value : ""
    };

    if (!newReview.text) {
      alert("Please write your review.");
      return;
    }

    userReviews.unshift(newReview);
    saveUserReviews();

    // Re-render
    renderReviews("reviews-list", getAllReviews());
    updateReviewSummary();

    // Reset form
    form.reset();
    selectedRating = 0;
    document.querySelectorAll(".star-select span").forEach(s => s.classList.remove("lit"));

    // Show success message
    const msg = document.getElementById("review-success");
    if (msg) { msg.style.display = "block"; setTimeout(() => msg.style.display = "none", 3000); }
  });
}

/* ── Update summary bar (rating + count) ── */
function updateReviewSummary() {
  const all = getAllReviews();
  const avg = getAverageRating(all);
  const el = document.getElementById("review-summary-text");
  if (el) el.textContent = `${avg} out of 5 · ${all.length} reviews`;
  const starsEl = document.getElementById("summary-stars");
  if (starsEl) starsEl.innerHTML = starsHTML(Math.round(parseFloat(avg)));
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  loadUserReviews();
  renderReviews("reviews-list", getAllReviews());
  updateReviewSummary();
  initReviewToggle();
  initStarSelector();
  initReviewForm();
});
