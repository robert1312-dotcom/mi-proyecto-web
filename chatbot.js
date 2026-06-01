/* ═══════════════════════════════════════════════════════════════
   InnovVentas – Chatbot AI Engine
   Plataforma: Microsoft Azure AI Language + Custom NLU
   AI-900T00 · Microsoft Azure AI Fundamentals
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────────────────
const state = {
  isOpen: false,
  cartCount: 3,
  cartItems: [
    { name: 'ASUS VivoBook 15 Pro', price: 'S/ 2,599', priceVal: 2599, image: 'img/asus.jpg' },
    { name: 'Sony WH-1000XM5', price: 'S/ 979', priceVal: 979, image: 'img/sonyaudicular.jpg' },
    { name: 'Logitech MX Master 3S', price: 'S/ 449', priceVal: 449, image: 'img/logitech.jpg' }
  ],
  sessionId: Math.random().toString(36).substr(2, 9),
  messageCount: 0,
  pendingRating: false,
  metrics: {
    consultasAtendidas: 4832,
    satisfaccion: 96,
    tiempoRespuesta: 3,
    carritosReducidos: 67
  }
};

// ── Product Catalog ────────────────────────────────────────────
const PRODUCTS = {
  laptop: {
    image: 'img/asus.jpg',
    emoji: '💻',
    name: 'ASUS VivoBook 15 Pro',
    price: 'S/ 2,599',
    desc: 'Intel i7 · 16GB RAM · 512GB SSD · OLED 15.6"',
    stock: true
  },
  phone: {
    image: 'img/s24ultra.jpg',
    emoji: '📱',
    name: 'Samsung Galaxy S24 Ultra',
    price: 'S/ 4,899',
    desc: 'Snapdragon 8 Gen 3 · 12GB · 200MP',
    stock: true
  },
  headphones: {
    image: 'img/sonyaudicular.jpg',
    emoji: '🎧',
    name: 'Sony WH-1000XM5',
    price: 'S/ 979',
    desc: 'ANC · 30h batería · Hi-Res Audio',
    stock: true
  },
  monitor: {
    image: 'img/lgultramonitor.jpg',
    emoji: '🖥️',
    name: 'LG UltraGear 27" 4K',
    price: 'S/ 1,649',
    desc: '4K IPS · 144Hz · G-Sync · HDR600',
    stock: false
  },
  tablet: {
    image: 'img/ipadpro.jpg',
    emoji: '📟',
    name: 'iPad Pro 12.9" M2',
    price: 'S/ 6,499',
    desc: 'Apple M2 · Liquid Retina XDR · 5G',
    stock: true
  },
  mouse: {
    image: 'img/logitech.jpg',
    emoji: '🖱️',
    name: 'Logitech MX Master 3S',
    price: 'S/ 449',
    desc: '8000 DPI · Silencioso · Recarga USB-C · Multi-dispositivo',
    stock: true
  }
};

// ── NLU Intent Map ──────────────────────────────────────────────
// Simula Azure AI Language / QnA Maker intent recognition
const INTENTS = [
  {
    intent: 'greeting',
    patterns: ['hola', 'buenas', 'buenos', 'hey', 'hi', 'saludos', 'buen día', 'buenas tardes', 'buenas noches'],
    handler: handleGreeting
  },
  {
    intent: 'payment_methods',
    patterns: ['pago', 'pagar', 'métodos de pago', 'tarjeta', 'efectivo', 'transferencia', 'yape', 'plin', 'cuotas', 'financiamiento', 'crédito', 'débito'],
    handler: handlePayment
  },
  {
    intent: 'shipping',
    patterns: ['envío', 'despacho', 'delivery', 'llegada', 'entrega', 'tiempo', 'cuándo llega', 'demora', 'shipping', 'cuánto demora'],
    handler: handleShipping
  },
  {
    intent: 'warranty',
    patterns: ['garantía', 'garantia', 'seguro', 'daño', 'roto', 'falla', 'técnico', 'reparación', 'servicio técnico'],
    handler: handleWarranty
  },
  {
    intent: 'returns',
    patterns: ['devolución', 'devolver', 'cambio', 'cambiar', 'reembolso', 'no sirve', 'defectuoso', 'retorno'],
    handler: handleReturns
  },
  {
    intent: 'product_laptop',
    patterns: ['laptop', 'notebook', 'computadora', 'computador', 'asus', 'lenovo', 'hp', 'dell', 'pc portátil'],
    handler: () => handleProduct('laptop')
  },
  {
    intent: 'product_phone',
    patterns: ['celular', 'teléfono', 'smartphone', 'samsung', 'iphone', 'galaxy', 'móvil', 'android'],
    handler: () => handleProduct('phone')
  },
  {
    intent: 'product_headphones',
    patterns: ['auriculares', 'audífonos', 'headphones', 'sony', 'bose', 'bluetooth', 'inalámbrico', 'música'],
    handler: () => handleProduct('headphones')
  },
  {
    intent: 'product_monitor',
    patterns: ['monitor', 'pantalla', 'lg', 'display', '4k', 'gaming', 'curvo', 'resolución'],
    handler: () => handleProduct('monitor')
  },
  {
    intent: 'product_tablet',
    patterns: ['tablet', 'ipad', 'tableta', 'apple', 'samsung tab', 'surface'],
    handler: () => handleProduct('tablet')
  },
  {
    intent: 'product_mouse',
    patterns: ['mouse', 'raton', 'ratón', 'logitech', 'mx master', 'periferico', 'periférico', 'perifericos', 'periféricos'],
    handler: () => handleProduct('mouse')
  },
  {
    intent: 'stock',
    patterns: ['disponible', 'disponibilidad', 'stock', 'hay', 'tienen', 'en inventario', 'queda'],
    handler: handleStock
  },
  {
    intent: 'price',
    patterns: ['precio', 'costo', 'cuánto cuesta', 'cuanto vale', 'oferta', 'descuento', 'promoción', 'barato', 'económico'],
    handler: handlePrice
  },
  {
    intent: 'cart',
    patterns: ['carrito', 'agregar', 'comprar', 'quiero', 'deseo', 'me interesa', 'añadir'],
    handler: handleCart
  },
  {
    intent: 'contact',
    patterns: ['contacto', 'teléfono', 'llamar', 'email', 'correo', 'whatsapp', 'hablar con', 'asesor', 'humano', 'persona', 'hablar con asesor', 'conectar asesor'],
    handler: handleContact
  },
  {
    intent: 'help',
    patterns: ['ayuda', 'help', 'necesito', 'problema', 'no puedo', 'error', 'no funciona', 'soporte'],
    handler: handleHelp
  },
  {
    intent: 'goodbye',
    patterns: ['gracias', 'adiós', 'hasta luego', 'chau', 'bye', 'nos vemos', 'listo', 'perfecto'],
    handler: handleGoodbye
  },
  {
    intent: 'main_menu',
    patterns: ['menú principal', 'menu principal', 'volver', 'inicio', 'opciones', 'ver opciones', 'regresar', 'menú'],
    handler: handleMainMenu
  }
];

// ── Quick Replies Config ───────────────────────────────────────
const INITIAL_QUICK_REPLIES = [
  '💳 Métodos de pago',
  '🚚 Tiempos de envío',
  '💻 Ver laptops',
  '📱 Ver smartphones',
  '🔄 Devoluciones',
  '🛡️ Garantía'
];

// ── Intent Matching ────────────────────────────────────────────
function matchIntent(text) {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let bestMatch = null;
  let maxScore = 0;

  for (const intentDef of INTENTS) {
    for (const pattern of intentDef.patterns) {
      const normalizedPattern = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Escapar caracteres especiales y usar límites de palabra (\b) para coincidencia exacta
      const escapedPattern = normalizedPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escapedPattern + '\\b', 'i');

      if (regex.test(normalized)) {
        const score = normalizedPattern.length;
        if (score > maxScore) {
          maxScore = score;
          bestMatch = intentDef;
        }
      }
    }
  }
  return bestMatch;
}

// ── Intent Handlers ────────────────────────────────────────────
function handleGreeting() {
  const greetings = [
    '¡Hola! 👋 Soy **Nova**, tu asistente de InnovVentas. Estoy aquí para ayudarte a encontrar el mejor producto tecnológico o resolver cualquier duda. ¿En qué puedo ayudarte hoy?',
    '¡Bienvenido a InnovVentas! 🎉 Soy Nova, tu asistente inteligente. Puedo ayudarte con preguntas sobre productos, pagos, envíos y más. ¿Qué necesitas?',
    '¡Hola! 😊 Me da mucho gusto atenderte. Soy Nova, el asistente virtual de InnovVentas. ¿En qué te puedo ayudar hoy?'
  ];
  return {
    text: greetings[Math.floor(Math.random() * greetings.length)],
    quickReplies: ['💻 Ver laptops', '📱 Smartphones', '💳 Medios de pago', '🚚 ¿Cuándo llega?']
  };
}

function handlePayment() {
  return {
    text: `💳 **Métodos de pago disponibles:**\n\n✅ Tarjetas de débito y crédito (Visa, Mastercard, Amex)\n✅ Transferencia bancaria (BCP, Interbank, BBVA, Scotiabank)\n✅ Yape y Plin (sin costo adicional)\n✅ PayPal\n✅ Pago en cuotas: hasta **24 meses sin intereses** con tarjetas afiliadas\n\n¿Tienes alguna duda adicional sobre los pagos?`,
    quickReplies: ['¿Hay intereses?', '¿Puedo pagar en efectivo?', '🚚 Ver envíos', '🔙 Menú principal']
  };
}

function handleShipping() {
  return {
    text: `🚚 **Información de envíos:**\n\n📦 **Lima Metropolitana:** 24 a 48 horas hábiles\n🏔️ **Provincias:** 3 a 5 días hábiles\n✈️ **Zonas alejadas:** 5 a 10 días hábiles\n\n💚 **Envío GRATIS** en compras mayores a S/ 200\n⚡ Envío express disponible por S/ 15 adicionales\n\n¿Quieres saber si tu producto tiene envío gratis?`,
    quickReplies: ['📍 Rastrear pedido', '⚡ Envío express', '💳 Métodos de pago', '🔙 Menú principal']
  };
}

function handleWarranty() {
  return {
    text: `🛡️ **Política de garantía InnovVentas:**\n\n🔧 **Garantía estándar:** 12 meses para todos los productos\n⭐ **Garantía extendida:** Hasta 36 meses (disponible al momento de la compra)\n\n¿Qué cubre la garantía?\n✅ Defectos de fábrica\n✅ Fallas de hardware\n✅ Problemas de batería (hasta 6 meses)\n\n❌ No cubre: daños por caída, agua o mal uso\n\n¿Necesitas hacer efectiva una garantía?`,
    quickReplies: ['📞 Contactar soporte', '🔄 Proceso de garantía', '🔙 Menú principal']
  };
}

function handleReturns() {
  return {
    text: `🔄 **Política de devoluciones:**\n\n⏱️ Tienes **30 días** desde la recepción del producto para solicitar una devolución.\n\n**Requisitos:**\n✅ Producto en estado original\n✅ Con todos sus accesorios y empaque\n✅ Número de orden o boleta\n\n**Proceso:**\n1. Solicita la devolución en nuestro portal\n2. Recoge programada (sin costo en Lima)\n3. Reembolso en 5 días hábiles\n\n¿Quieres iniciar una devolución ahora?`,
    quickReplies: ['📞 Iniciar devolución', '🛡️ Garantía', '🔙 Menú principal']
  };
}

function handleProduct(type) {
  const p = PRODUCTS[type];
  if (!p) return handleFallback();
  const stockText = p.stock ? '✅ En stock · Envío inmediato' : '⚠️ Stock limitado · Consultar disponibilidad';
  return {
    text: `¡Excelente elección! Aquí te muestro nuestra mejor opción:`,
    product: p,
    stockText,
    quickReplies: ['🛒 Agregar al carrito', '💳 ¿Cómo pago?', '🚚 ¿Cuándo llega?', '🔍 Ver más opciones']
  };
}

function handleStock() {
  return {
    text: `📦 **Disponibilidad de productos:**\n\n✅ **En stock ahora:**\n• ASUS VivoBook 15 Pro (12 unidades)\n• Samsung Galaxy S24 Ultra (8 unidades)\n• Sony WH-1000XM5 (23 unidades)\n• iPad Pro 12.9" M2 (5 unidades)\n• Logitech MX Master 3S (15 unidades)\n\n⚠️ **Stock limitado:**\n• LG UltraGear 27" 4K (2 unidades)\n\n¿Te interesa alguno en particular?`,
    quickReplies: ['💻 Ver laptops', '📱 Ver smartphones', '🎧 Ver auriculares', '🖱️ Ver periféricos', '🔙 Menú principal']
  };
}

function handlePrice() {
  return {
    text: `💰 **Nuestras mejores ofertas de hoy:**\n\n💻 ASUS VivoBook 15 Pro → **S/ 2,599** *(antes S/ 3,200)*\n📱 Samsung Galaxy S24 Ultra → **S/ 4,899** *(antes S/ 5,800)*\n🎧 Sony WH-1000XM5 → **S/ 979** *(antes S/ 1,400)*\n🖥️ LG UltraGear 27" 4K → **S/ 1,649** *(antes S/ 2,100)*\n📟 iPad Pro 12.9" M2 → **S/ 6,499**\n🖱️ Logitech MX Master 3S → **S/ 449** *(antes S/ 600)*\n\n¿Quieres saber más sobre alguno?`,
    quickReplies: ['💻 Laptops', '📱 Smartphones', '🖱️ Periféricos', '🔙 Menú principal']
  };
}

function handleCart() {
  state.cartCount++;
  document.querySelector('.cart-badge').textContent = state.cartCount;
  return {
    text: `🛒 ¡Perfecto! He agregado el producto a tu carrito. Ahora tienes **${state.cartCount} artículos**.\n\n¿Deseas continuar comprando o proceder al pago?`,
    quickReplies: ['💳 Ir al checkout', '🛍️ Seguir comprando', '🔙 Menú principal']
  };
}

function handleContact() {
  return {
    text: `📞 **Canales de contacto InnovVentas:**\n\n📱 WhatsApp: **+51 987 654 321**\n📧 Email: soporte@innovventas.pe\n🌐 Portal: www.innovventas.pe/soporte\n\n🕐 **Horario de atención humana:**\nLunes a Viernes: 9am – 8pm\nSábados: 10am – 6pm\nDomingos: Solo chatbot (¡Soy yo! 😊)\n\n¿Quieres que te conecte con un asesor?`,
    quickReplies: ['💬 Hablar con asesor', '📧 Enviar email', '🔙 Menú principal']
  };
}

function handleHelp() {
  return {
    text: `🆘 **Estoy aquí para ayudarte.** ¿Cuál es el problema?\n\nPuedo asistirte con:\n🔧 Soporte técnico básico\n📦 Estado de tu pedido\n🔄 Devoluciones y garantías\n💳 Problemas con pagos\n🌐 Dificultades en el sitio web\n\nSi el problema persiste, te conecto con un asesor especializado.`,
    quickReplies: ['📦 Mi pedido', '🔄 Devolver producto', '📞 Hablar con asesor', '🔙 Menú principal']
  };
}

function handleMainMenu() {
  return {
    text: `👋 ¡Claro! Aquí están todas las opciones disponibles. ¿En qué puedo ayudarte?`,
    quickReplies: ['💳 Métodos de pago', '🚚 Tiempos de envío', '💻 Ver laptops', '📱 Ver smartphones', '🎧 Ver auriculares', '📦 Disponibilidad', '🔄 Devoluciones', '🛡️ Garantía', '📞 Contactar soporte']
  };
}

function handleGoodbye() {
  const responses = [
    `¡Muchas gracias por contactarnos! 🎉 Fue un placer ayudarte. Si necesitas algo más, ¡aquí estaré! 👋`,
    `¡Hasta luego! 😊 Espero haberte sido de ayuda. Recuerda que puedes escribirnos en cualquier momento. ¡Buen día! ⚡`,
    `¡Fue un placer atenderte! 💜 Vuelve pronto a InnovVentas. ¡Hasta la próxima! 👋`
  ];
  return {
    text: responses[Math.floor(Math.random() * responses.length)],
    showRating: true,
    quickReplies: []
  };
}

function handleFallback() {
  const fallbacks = [
    `Entiendo tu consulta 🤔 Puedo ayudarte con información sobre **productos, pagos, envíos, garantías y devoluciones**. ¿Sobre cuál tema necesitas información?`,
    `Hmm, no estoy seguro de entenderte bien. 😅 ¿Puedes ser más específico? Puedo ayudarte con información sobre nuestros productos tecnológicos, métodos de pago, envíos y soporte técnico.`,
    `Esa consulta está fuera de mi alcance por ahora. 🤖 Pero puedo conectarte con un asesor humano o responder sobre **productos, pagos, envíos y garantías**. ¿Qué prefieres?`
  ];
  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    quickReplies: ['💳 Pagos', '🚚 Envíos', '🛡️ Garantía', '📞 Hablar con asesor']
  };
}

// ── DOM Helpers ────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  const msgs = document.getElementById('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;
}

function setQuickReplies(replies) {
  const container = document.getElementById('quickReplies');
  container.innerHTML = '';
  if (!replies || replies.length === 0) return;
  replies.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      sendQuickReply(label);
    });
    container.appendChild(btn);
  });
}

function appendUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg user';
  wrap.innerHTML = `
    <div class="msg-avatar user">👤</div>
    <div class="msg-wrap">
      <div class="msg-bubble user">${escapeHtml(text)}</div>
      <span class="msg-time">${getTime()}</span>
    </div>
  `;
  msgs.appendChild(wrap);
  scrollToBottom();
  state.messageCount++;
}

function appendBotMessage(response, delay = 0, showTyping = true) {
  const msgs = document.getElementById('chatMessages');

  if (showTyping) {
    // Show typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = `
      <div class="msg-avatar bot">🤖</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    msgs.appendChild(typingEl);
    scrollToBottom();
  }

  const typingDelay = showTyping ? (delay || (800 + Math.random() * 800)) : 0;

  const renderMessage = () => {
    if (showTyping) {
      const old = document.getElementById('typingIndicator');
      if (old) old.remove();
    }

    const wrap = document.createElement('div');
    wrap.className = 'chat-msg';

    let extraHTML = '';

    // Product card
    if (response.product) {
      const p = response.product;
      const mediaHTML = p.image
        ? `<img src="${p.image}" alt="${p.name}" class="chat-product-img-real" />`
        : `<div class="chat-product-emoji">${p.emoji}</div>`;
      extraHTML += `
        <div class="chat-product-card">
          ${mediaHTML}
          <div class="chat-product-info">
            <div class="chat-product-name">${p.name}</div>
            <div class="chat-product-price">${p.price}</div>
            <div class="chat-product-desc">${p.desc}</div>
          </div>
          <button class="chat-product-btn" onclick="addToCartFromChat('${p.name}')">&#x1F6D2; Agregar</button>
        </div>
        <p style="font-size:0.72rem;color:var(--brand-accent);margin-top:6px;">${response.stockText || ''}</p>
      `;
    }

    // Rating
    if (response.showRating) {
      extraHTML += `
        <div class="chat-rating">
          <p>¿Cómo calificarías mi atención hoy?</p>
          <div class="rating-stars">
            ${[1,2,3,4,5].map(i => `<button class="rating-star" onclick="rateChat(${i})" title="${i} estrella${i>1?'s':''}">${i<=3?'😐':'⭐'}</button>`).join('')}
          </div>
        </div>
      `;
    }

    wrap.innerHTML = `
      <div class="msg-avatar bot">🤖</div>
      <div class="msg-wrap">
        <div class="msg-bubble bot">${formatMarkdown(response.text)}${extraHTML}</div>
        <span class="msg-time">${getTime()}</span>
      </div>
    `;
    msgs.appendChild(wrap);

    if (response.quickReplies) setQuickReplies(response.quickReplies);

    scrollToBottom();
  };

  if (typingDelay > 0) {
    setTimeout(renderMessage, typingDelay);
  } else {
    renderMessage();
  }
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ── Chat Open/Close ────────────────────────────────────────────
function openChat() {
  state.isOpen = true;
  document.getElementById('chatWidget').classList.add('open');
  document.getElementById('chatLauncherIcon').textContent = '✕';

  if (state.messageCount === 0) {
    // Initial greeting from bot
    setTimeout(() => {
      appendBotMessage(handleGreeting(), 600);
    }, 200);

    setTimeout(() => {
      setQuickReplies(INITIAL_QUICK_REPLIES);
    }, 1800);
  }

  setTimeout(() => {
    document.getElementById('chatInput').focus();
  }, 400);
}

function closeChat() {
  state.isOpen = false;
  document.getElementById('chatWidget').classList.remove('open');
  document.getElementById('chatLauncherIcon').textContent = '💬';
}

// ── Send Message ───────────────────────────────────────────────
function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  setQuickReplies([]);
  appendUserMessage(text);

  // NLU Processing (simulated Azure AI Language)
  const matched = matchIntent(text);
  if (matched) {
    appendBotMessage(matched.handler());
  } else {
    callGeminiAPI(text);
  }
}

function sendQuickReply(label) {
  // Strip emoji prefix for processing
  const text = label.replace(/^[^\w\s]+\s?/, '').trim();
  setQuickReplies([]);
  appendUserMessage(label);

  const matched = matchIntent(label) || matchIntent(text);
  if (matched) {
    appendBotMessage(matched.handler());
  } else {
    callGeminiAPI(text);
  }
}

// ── Gemini API Connection (directa desde el navegador, sin PHP) ─
const GEMINI_API_KEY = 'AQ.Ab8RN6Kmdd0BMiXenQtk-2pulENR74YRZ4opJG9tGm0qaC1liQ';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGeminiAPI(messageText) {
  const msgs = document.getElementById('chatMessages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg';
  typingEl.id = 'geminiTypingIndicator';
  typingEl.innerHTML = `
    <div class="msg-avatar bot">🤖</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  msgs.appendChild(typingEl);
  scrollToBottom();

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres Nova, el asistente virtual de InnovVentas, una tienda de tecnología peruana. 
Responde en español, de forma amable y concisa (máximo 3 oraciones). 
Solo responde sobre tecnología, productos electrónicos o consultas de la tienda.
Consulta del cliente: ${messageText}`
          }]
        }]
      })
    });

    const oldIndicator = document.getElementById('geminiTypingIndicator');
    if (oldIndicator) oldIndicator.remove();

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      appendBotMessage({ text: data.candidates[0].content.parts[0].text }, 0, false);
    } else {
      appendBotMessage({ text: `🤔 No pude procesar esa consulta. ¿Puedes reformularla?`, quickReplies: INITIAL_QUICK_REPLIES }, 0, false);
    }
  } catch (error) {
    const oldIndicator = document.getElementById('geminiTypingIndicator');
    if (oldIndicator) oldIndicator.remove();
    appendBotMessage({ text: `🤔 No entendí bien tu consulta. Puedo ayudarte con productos, pagos, envíos y garantías.`, quickReplies: INITIAL_QUICK_REPLIES }, 0, false);
  }
}

// ── Cart Functions ─────────────────────────────────────────────
function addToCart(btn, productName) {
  const prod = Object.values(PRODUCTS).find(p => p.name === productName) || {
    name: productName,
    price: 'S/ 0',
    image: '',
    emoji: '📦'
  };
  state.cartItems.push({
    name: prod.name,
    price: prod.price,
    priceVal: parsePrice(prod.price),
    image: prod.image,
    emoji: prod.emoji
  });
  updateCartUI();

  btn.textContent = '✅ Agregado';
  btn.classList.add('added');
  showToast(`✅ ${productName} agregado al carrito`);
  setTimeout(() => {
    btn.textContent = 'Agregar';
    btn.classList.remove('added');
  }, 3000);
}

function addToCartFromChat(productName) {
  const prod = Object.values(PRODUCTS).find(p => p.name === productName) || {
    name: productName,
    price: 'S/ 0',
    image: '',
    emoji: '📦'
  };
  state.cartItems.push({
    name: prod.name,
    price: prod.price,
    priceVal: parsePrice(prod.price),
    image: prod.image,
    emoji: prod.emoji
  });
  updateCartUI();

  showToast(`✅ ${productName} agregado al carrito`);
  appendBotMessage({
    text: `¡Perfecto! 🛒 **${productName}** fue agregado a tu carrito. Tienes **${state.cartCount} artículos**.\n\n¿Deseas continuar comprando o ir al checkout?`,
    quickReplies: ['💳 Ir al pago', '🛍️ Seguir comprando', '🚚 ¿Cuándo llega?']
  });
}

// ── Cart Modal Logic ───────────────────────────────────────────
function openCartModal() {
  renderCartModal();
  document.getElementById('cartModalOverlay').classList.add('open');
}

function closeCartModal() {
  document.getElementById('cartModalOverlay').classList.remove('open');
}

function removeCartItem(index) {
  const item = state.cartItems[index];
  state.cartItems.splice(index, 1);
  updateCartUI();
  showToast(`❌ ${item.name} eliminado del carrito`);
}

function clearCart() {
  state.cartItems = [];
  updateCartUI();
  showToast('🛒 Carrito vaciado');
}

function checkoutCart() {
  if (state.cartItems.length === 0) {
    showToast('⚠️ El carrito está vacío');
    return;
  }
  showToast('💳 Redirigiendo a pasarela de pago...');
  setTimeout(() => {
    alert(`¡Gracias por tu simulación de compra!\nTotal a pagar: S/ ${calculateTotal().toLocaleString()}`);
    clearCart();
    closeCartModal();
  }, 1000);
}

function calculateTotal() {
  return state.cartItems.reduce((acc, item) => acc + (item.priceVal || parsePrice(item.price)), 0);
}

function renderCartModal() {
  const body = document.getElementById('cartModalBody');
  const totalVal = document.getElementById('cartTotalValue');
  
  if (!body) return;
  
  if (state.cartItems.length === 0) {
    body.innerHTML = '<div class="cart-empty-msg">Tu carrito está vacío. ¡Agrega productos desde la tienda o el chat! 🛍️</div>';
    totalVal.textContent = 'S/ 0';
    return;
  }
  
  let html = '';
  state.cartItems.forEach((item, index) => {
    const mediaHTML = item.image
      ? `<div class="cart-item-img"><img src="${item.image}" alt="${item.name}" /></div>`
      : `<div class="cart-item-emoji">${item.emoji || '📦'}</div>`;
      
    html += `
      <div class="cart-item">
        ${mediaHTML}
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price}</div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem(${index})" title="Eliminar artículo">&times;</button>
      </div>
    `;
  });
  
  body.innerHTML = html;
  totalVal.textContent = `S/ ${calculateTotal().toLocaleString()}`;
}

function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  return parseFloat(priceStr.replace(/[^\d.-]/g, '')) || 0;
}

function updateCartUI() {
  state.cartCount = state.cartItems.length;
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = state.cartCount;
  renderCartModal();
}

// ── Rating ─────────────────────────────────────────────────────
function rateChat(stars) {
  if (state.pendingRating) return;
  state.pendingRating = true;
  const messages = {
    1: '😔 Lamentamos tu experiencia. Mejoraremos pronto.',
    2: '😕 Gracias por tu honestidad. Trabajaremos para mejorar.',
    3: '😊 ¡Gracias! Tu opinión nos ayuda a mejorar.',
    4: '😄 ¡Genial! Nos alegra haber sido de ayuda.',
    5: '🌟 ¡Increíble! Gracias por tu calificación. ¡Vuelve pronto!'
  };
  appendBotMessage({
    text: `${messages[stars]}\n\nGracias por usar el chatbot de **InnovVentas**. ¡Hasta pronto! 👋`,
    quickReplies: []
  });
  showToast(`⭐ Calificaste con ${stars} estrella${stars > 1 ? 's' : ''}. ¡Gracias!`);
}

// ── Toast ──────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Metric Counter Animation ───────────────────────────────────
function animateCounters() {
  const elements = document.querySelectorAll('.metric-value[data-target]');
  elements.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  });
}

// ── Intersection Observer for metrics ─────────────────────────
const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      metricObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const metricsSection = document.querySelector('.metrics-section');
  if (metricsSection) metricObserver.observe(metricsSection);

  // Auto-open chat tooltip after 3s
  setTimeout(() => {
    showToast('💬 ¡Nova está en línea! Haz clic para chatear.');
  }, 3000);

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 40px rgba(0,0,0,0.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // Configurar botón del carrito
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCartModal);
  }

  // Inicializar UI de carrito
  updateCartUI();
});
