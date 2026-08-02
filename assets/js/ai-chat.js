/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Multi-Agent AI Chat
   6 Agents: Orchestrator, Product, Style,
   Order, Support, Analytics
═══════════════════════════════════════ */

// ↓↓↓ PASTE YOUR ANTHROPIC API KEY HERE ↓↓↓
const ANTHROPIC_API_KEY = "YOUR_API_KEY_HERE";
// ↑↑↑ GET YOUR KEY FROM: https://console.anthropic.com ↑↑↑

const WHATSAPP_NUM = "923076064194";

/* ── Load products for agent context ── */
let productCatalog = [];
async function fetchCatalog() {
  try {
    const res = await fetch("data/products.json");
    productCatalog = await res.json();
  } catch(e) { productCatalog = []; }
}

/* ── Build catalog text for AI context ── */
function buildCatalogContext() {
  return productCatalog.map(p =>
    `[${p.id}] ${p.name} | Category: ${p.category} | Price: Rs.${p.price} | Was: Rs.${p.originalPrice} | Discount: ${Math.round(((p.originalPrice-p.price)/p.originalPrice)*100)}% | Fabric: ${p.fabric} | Available: ${p.available ? "YES" : "NO - OUT OF STOCK"}`
  ).join("\n");
}

/* ══════════════════════════════════════
   AGENT SYSTEM PROMPTS
══════════════════════════════════════ */
function getOrchestratorPrompt() {
  return `You are the Orchestrator Agent for Zain Elegance, a premium Pakistani fabric store. Your ONLY job is to classify the user's message and route it.
Classify the intent as exactly ONE of:
- PRODUCT_QUERY → asking about products, prices, availability, categories
- STYLE_HELP → asking for recommendations, what to wear, occasion styling, gift ideas
- ORDER_INTENT → wants to buy, order, place order, checkout
- SUPPORT → complaints, returns, delivery, fabric quality questions, problems
- GREETING → hello, hi, salaam, general greeting
Respond with ONLY the classification word. Nothing else.`;
}

function getProductAgentPrompt() {
  return `You are the Product Advisor for Zain Elegance — a premium Pakistani fabric and clothing store sourcing from ASAD ZAIN premium fabrics.
CURRENT PRODUCT CATALOG:
${buildCatalogContext()}
Your rules:
1. Answer product questions clearly and warmly in a mix of English and simple Urdu if natural
2. Always mention the discounted price AND show the original price as "was Rs.X"
3. If a product is OUT OF STOCK, say so clearly and suggest similar available items
4. Always end by encouraging them to order on WhatsApp for fast service
5. Be concise — max 4-5 lines
6. Mention "ASAD ZAIN premium fabric" quality when relevant
Do NOT make up products not in the catalog.`;
}

function getStyleAgentPrompt() {
  return `You are the Style Advisor for Zain Elegance — a premium Pakistani fabric store.
CURRENT PRODUCT CATALOG:
${buildCatalogContext()}
Your job: Give warm, personal styling recommendations based on occasion, budget, or preference.
Rules:
1. Recommend only AVAILABLE products from the catalog
2. Consider Pakistani occasions: weddings, Eid, office, casual, formal
3. Suggest combos when appropriate (e.g., matching suit + bedsheet as a gift set)
4. Be warm, like a knowledgeable friend — not a robot
5. End with a WhatsApp order suggestion
6. Keep it to 5-6 lines max`;
}

function getOrderAgentPrompt() {
  return `You are the Order Assistant for Zain Elegance.
PRODUCT CATALOG:
${buildCatalogContext()}
When a customer wants to order:
1. Confirm which product they want (match from catalog)
2. Mention the price with discount clearly
3. Tell them to click the WhatsApp button to complete their order — it will auto-fill the product details
4. Assure them: fast delivery, quality guaranteed, easy returns
5. Be warm and professional
Keep response to 4-5 lines.`;
}

function getSupportAgentPrompt() {
  return `You are the Customer Support Agent for Zain Elegance.
Store policies:
- Returns: 7-day return policy for unused items in original packaging
- Delivery: 2-5 business days across Pakistan. Lahore 1-2 days.
- Fabric quality: All fabric sourced from ASAD ZAIN premium fabrics — Pakistan's finest
- Payment: Bank transfer, EasyPaisa, JazzCash, Cash on Delivery available
- For complaints: Direct to WhatsApp immediately for fastest resolution
Rules:
1. Be empathetic and helpful
2. Give clear policy-based answers
3. For unresolved issues, direct them to WhatsApp for human support
4. Reassure the customer — Zain Elegance stands behind every product
Keep response to 4-5 lines.`;
}

/* ══════════════════════════════════════
   AGENT CALLER
══════════════════════════════════════ */
async function callClaude(systemPrompt, userMessage, conversationHistory = []) {
  const messages = [
    ...conversationHistory.slice(-6),
    { role: "user", content: userMessage }
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,          // ← API key used here automatically
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-allow-browser": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    })
  });

  const data = await response.json();
  if (data.content && data.content[0]) {
    return data.content[0].text.trim();
  }
  throw new Error("No response from Claude");
}

/* ══════════════════════════════════════
   ORCHESTRATOR — routes to right agent
══════════════════════════════════════ */
async function orchestrate(userMessage, history) {
  let intent = "PRODUCT_QUERY";
  try {
    const raw = await callClaude(getOrchestratorPrompt(), userMessage);
    const clean = raw.toUpperCase().trim();
    if (["PRODUCT_QUERY","STYLE_HELP","ORDER_INTENT","SUPPORT","GREETING"].includes(clean)) {
      intent = clean;
    }
  } catch(e) { /* use default */ }

  if (intent === "GREETING") {
    return "Assalamu Alaikum! 👋 Welcome to **Zain Elegance** — premium fabrics from ASAD ZAIN. I can help you explore our suits, bedsheets, sofa covers, and comforters. What are you looking for today?";
  }

  const prompts = {
    PRODUCT_QUERY: getProductAgentPrompt(),
    STYLE_HELP:    getStyleAgentPrompt(),
    ORDER_INTENT:  getOrderAgentPrompt(),
    SUPPORT:       getSupportAgentPrompt()
  };

  const agentPrompt = prompts[intent] || getProductAgentPrompt();

  try {
    const reply = await callClaude(agentPrompt, userMessage, history);
    logAnalytics(intent, userMessage);
    return reply;
  } catch(e) {
    return `Apologies for the inconvenience! Please reach us directly on WhatsApp for immediate help — our team responds within minutes. 📱`;
  }
}

/* ══════════════════════════════════════
   ANALYTICS AGENT (silent logger)
══════════════════════════════════════ */
function logAnalytics(intent, message) {
  try {
    const key = "ze_analytics";
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    data.push({ intent, message: message.substring(0,80), ts: new Date().toISOString() });
    if (data.length > 100) data.splice(0, data.length - 100);
    localStorage.setItem(key, JSON.stringify(data));
  } catch(e) {}
}

/* ══════════════════════════════════════
   CHAT UI
══════════════════════════════════════ */
let chatHistory = [];
let chatOpen = false;
let isTyping = false;

function initChat() {
  const btn     = document.getElementById("chat-btn");
  const window_ = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const input   = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  if (!btn || !window_) return;

  btn.addEventListener("click", () => {
    chatOpen = !chatOpen;
    window_.classList.toggle("open", chatOpen);
    if (chatOpen && messages.children.length === 0) {
      addBotMessage("Assalamu Alaikum! 👋 Welcome to Zain Elegance. I'm your personal style assistant. Ask me about our suits, bedsheets, sofa covers, or comforters!");
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", () => {
    chatOpen = false;
    window_.classList.remove("open");
  });

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  if (input) input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    if (isTyping) return;
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = "";
    chatHistory.push({ role: "user", content: text });
    isTyping = true;
    const typingEl = showTyping();
    try {
      const reply = await orchestrate(text, chatHistory);
      typingEl.remove();
      addBotMessage(reply);
      chatHistory.push({ role: "assistant", content: reply });
    } catch(e) {
      typingEl.remove();
      addBotMessage("Sorry, something went wrong. Please try again or contact us on WhatsApp directly!");
    }
    isTyping = false;
  }

  function addUserMessage(text) {
    const el = document.createElement("div");
    el.className = "chat-msg user";
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBotMessage(text) {
    const el = document.createElement("div");
    el.className = "chat-msg bot";
    el.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "chat-msg bot chat-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }
}

/* ── WhatsApp float button ── */
function initWAFloat() {
  const btn = document.getElementById("wa-float");
  if (btn) {
    btn.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent("Assalamu Alaikum! I want to enquire about your products.")}`;
  }
}

/* ── Nav hamburger ── */
function initNav() {
  const ham = document.getElementById("nav-hamburger");
  const menu = document.getElementById("mobile-menu");
  if (ham && menu) {
    ham.addEventListener("click", () => menu.classList.toggle("open"));
  }
  document.querySelectorAll(".mobile-menu a").forEach(a => {
    a.addEventListener("click", () => menu && menu.classList.remove("open"));
  });
}

/* ── Init all ── */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCatalog();
  initChat();
  initWAFloat();
  initNav();
});
