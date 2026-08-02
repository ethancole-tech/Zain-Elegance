/* ═══════════════════════════════════════
   ZAIN ELEGANCE — Multi-Agent AI Chat
   Fixed: API key header + error logging
═══════════════════════════════════════ */

// ↓↓↓ PASTE YOUR ANTHROPIC API KEY HERE ↓↓↓
const ANTHROPIC_API_KEY = "ABSKQmVkcm9ja0FQSUtleS0xc2VtLWF0LTcwMjA3OTUwMTAzNTpoZTVTQ29qMlh2MHV5NnVzcHY2Z0piTGo5VXcxVThqMGsxanBESGFObEVDOGs2R3hWWUdqYlR1eFFoMD0=";
// ↑↑↑ GET IT FROM: https://console.anthropic.com ↑↑↑

const WHATSAPP_NUM = "923076064194";

/* ── Load products ── */
let productCatalog = [];
async function fetchCatalog() {
  try {
    const res = await fetch("data/products.json");
    productCatalog = await res.json();
  } catch(e) { productCatalog = []; }
}

function buildCatalogContext() {
  return productCatalog.map(p =>
    `[${p.id}] ${p.name} | Category: ${p.category} | Price: Rs.${p.price} | Was: Rs.${p.originalPrice} | Discount: ${Math.round(((p.originalPrice-p.price)/p.originalPrice)*100)}% | Fabric: ${p.fabric} | Available: ${p.available ? "YES" : "NO - OUT OF STOCK"}`
  ).join("\n");
}

/* ══════════════════════════════════════
   AGENT PROMPTS
══════════════════════════════════════ */
function getOrchestratorPrompt() {
  return `You are the Orchestrator Agent for Zain Elegance, a premium Pakistani fabric store. Your ONLY job is to classify the user's message and route it.
Classify the intent as exactly ONE of:
- PRODUCT_QUERY
- STYLE_HELP
- ORDER_INTENT
- SUPPORT
- GREETING
Respond with ONLY that single word. No punctuation, no explanation.`;
}

function getProductAgentPrompt() {
  return `You are the Product Advisor for Zain Elegance — a premium Pakistani fabric store sourcing from ASAD ZAIN premium fabrics.
CURRENT PRODUCT CATALOG:
${buildCatalogContext()}
Rules:
1. Answer warmly in English (you may add simple Urdu phrases naturally)
2. Always show discounted price AND crossed-out original price
3. If OUT OF STOCK, say so and suggest alternatives
4. End by encouraging WhatsApp order
5. Max 5 lines
6. Only mention products actually in the catalog above`;
}

function getStyleAgentPrompt() {
  return `You are the Style Advisor for Zain Elegance — a premium Pakistani fabric store.
CURRENT PRODUCT CATALOG:
${buildCatalogContext()}
Rules:
1. Only recommend AVAILABLE products
2. Consider Pakistani occasions: weddings, Eid, office, casual, formal
3. Suggest combos when fitting
4. Be warm and friendly — like a knowledgeable friend
5. End with WhatsApp suggestion
6. Max 6 lines`;
}

function getOrderAgentPrompt() {
  return `You are the Order Assistant for Zain Elegance.
CATALOG:
${buildCatalogContext()}
Rules:
1. Confirm product and price with discount
2. Tell them to use the WhatsApp button — it auto-fills order details
3. Mention fast delivery, quality guaranteed, easy returns
4. Be warm and professional
5. Max 5 lines`;
}

function getSupportAgentPrompt() {
  return `You are the Customer Support Agent for Zain Elegance.
Policies:
- Returns: 7 days, unused, original packaging
- Delivery: 2-5 business days Pakistan-wide. Lahore: 1-2 days
- Fabric: sourced from ASAD ZAIN — Pakistan's finest
- Payment: EasyPaisa, JazzCash, Bank Transfer, Cash on Delivery
- Complaints: resolve via WhatsApp immediately
Rules:
1. Be empathetic
2. Give clear answers based on policies above
3. For unresolved issues, direct to WhatsApp
4. Max 5 lines`;
}

/* ══════════════════════════════════════
   CORE API CALL — Fixed headers
══════════════════════════════════════ */
async function callClaude(systemPrompt, userMessage, conversationHistory = []) {
  // Check key is set
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error("API_KEY_NOT_SET");
  }

  const messages = [
    ...conversationHistory.slice(-6),
    { role: "user", content: userMessage }
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
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

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Claude API error:", response.status, err);
    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = await response.json();
  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text.trim();
  }
  throw new Error("EMPTY_RESPONSE");
}

/* ══════════════════════════════════════
   ORCHESTRATOR
══════════════════════════════════════ */
async function orchestrate(userMessage, history) {
  // Greeting shortcut (no API call needed)
  const lower = userMessage.toLowerCase().trim();
  if (["hi","hello","salam","salaam","assalamu","aoa","hey","helo"].some(g => lower.startsWith(g))) {
    return "Assalamu Alaikum! 👋 Welcome to **Zain Elegance** — premium fabrics from ASAD ZAIN.\n\nI can help you with:\n• Product prices & availability\n• Style recommendations\n• Placing an order\n• Returns & delivery info\n\nWhat are you looking for today?";
  }

  let intent = "PRODUCT_QUERY";
  try {
    const raw = await callClaude(getOrchestratorPrompt(), userMessage);
    const clean = raw.toUpperCase().replace(/[^A-Z_]/g, "").trim();
    if (["PRODUCT_QUERY","STYLE_HELP","ORDER_INTENT","SUPPORT","GREETING"].includes(clean)) {
      intent = clean;
    }
  } catch(e) {
    if (e.message === "API_KEY_NOT_SET") {
      return "⚠️ AI chat is not activated yet. Please add your Anthropic API key to the ai-chat.js file.\n\nMeanwhile, contact us directly on **WhatsApp** — we reply instantly! 📱";
    }
    // On any other error, still try the main agent below
  }

  if (intent === "GREETING") {
    return "Assalamu Alaikum! 👋 Welcome to **Zain Elegance**. I'm your personal style assistant. What are you looking for today?";
  }

  const prompts = {
    PRODUCT_QUERY: getProductAgentPrompt(),
    STYLE_HELP:    getStyleAgentPrompt(),
    ORDER_INTENT:  getOrderAgentPrompt(),
    SUPPORT:       getSupportAgentPrompt()
  };

  try {
    const reply = await callClaude(prompts[intent] || getProductAgentPrompt(), userMessage, history);
    logAnalytics(intent, userMessage);
    return reply;
  } catch(e) {
    console.error("Agent error:", e.message);

    // Specific helpful error messages instead of generic apology
    if (e.message === "API_KEY_NOT_SET") {
      return "⚠️ AI chat is not activated yet. Please add your Anthropic API key.\n\nContact us on **WhatsApp** for immediate help! 📱";
    }
    if (e.message.includes("401")) {
      return "⚠️ API key is incorrect or expired. Please check your Anthropic API key in ai-chat.js.\n\nFor now, please contact us on **WhatsApp**! 📱";
    }
    if (e.message.includes("429")) {
      return "I'm receiving too many requests right now. Please try again in a moment, or contact us directly on **WhatsApp**! 📱";
    }
    if (e.message.includes("500") || e.message.includes("529")) {
      return "The AI service is temporarily busy. Please try again shortly, or reach us on **WhatsApp** for instant help! 📱";
    }

    return "I'm having a small technical issue right now. Please contact us directly on **WhatsApp** — we respond within minutes! 📱";
  }
}

/* ══════════════════════════════════════
   ANALYTICS LOGGER (silent)
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
  const btn      = document.getElementById("chat-btn");
  const window_  = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const input    = document.getElementById("chat-input");
  const sendBtn  = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  if (!btn || !window_) return;

  btn.addEventListener("click", () => {
    chatOpen = !chatOpen;
    window_.classList.toggle("open", chatOpen);
    if (chatOpen && messages.children.length === 0) {
      addBotMessage("Assalamu Alaikum! 👋 Welcome to **Zain Elegance**.\n\nI can help with products, prices, style advice, and orders. What are you looking for?");
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
      addBotMessage("Something went wrong. Please contact us on **WhatsApp** for immediate help! 📱");
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

/* ── WhatsApp float ── */
function initWAFloat() {
  const btn = document.getElementById("wa-float");
  if (btn) {
    btn.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent("Assalamu Alaikum! I want to enquire about your products.")}`;
  }
}

/* ── Nav hamburger ── */
function initNav() {
  const ham  = document.getElementById("nav-hamburger");
  const menu = document.getElementById("mobile-menu");
  if (ham && menu) {
    ham.addEventListener("click", () => menu.classList.toggle("open"));
  }
  document.querySelectorAll(".mobile-menu a").forEach(a => {
    a.addEventListener("click", () => menu && menu.classList.remove("open"));
  });
}

/* ── Boot ── */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCatalog();
  initChat();
  initWAFloat();
  initNav();
});
