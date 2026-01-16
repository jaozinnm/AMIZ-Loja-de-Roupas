fetch("produtos.json")
  .then(res => res.json())
  .then(produtos => {
    renderProdutos(produtos.filter(p => p.active));
  });

function renderProdutos(produtos) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  produtos.forEach(p => {
    grid.innerHTML += `
      <div class="product" data-name="${p.name}">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        ${
          p.promo
            ? `<strong>R$ ${p.promo_price}</strong>`
            : `<strong>R$ ${p.price}</strong>`
        }
      </div>
    `;
  });
}


// ==============================
// AMIZ — interações (JS puro)
// ==============================

// Ano
document.getElementById("year").textContent = new Date().getFullYear();

// WhatsApp
const WA_NUMBER = "558199268577"; // 55 + DDD + numero (sem + e sem espacos)
function waLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

// --------------------------------
// Drawer mobile
// --------------------------------
const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");
const overlay = document.getElementById("drawerOverlay");

function openDrawer() {
  drawer?.classList.add("open");
  overlay?.classList.add("show");
  burger?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function hideDrawer() {
  drawer?.classList.remove("open");
  overlay?.classList.remove("show");
  burger?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

burger?.addEventListener("click", openDrawer);
closeDrawer?.addEventListener("click", hideDrawer);
overlay?.addEventListener("click", hideDrawer);

drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", hideDrawer));

// Fecha o drawer se sair do mobile para desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 780) hideDrawer();
});

// --------------------------------
// Carousel (com swipe no mobile)
// --------------------------------
const carousel = document.getElementById("carousel");
const slides = Array.from(document.querySelectorAll(".slide"));
const dotsWrap = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let idx = 0;
let timer = null;

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === idx ? " active" : "");
    b.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
}

function goTo(i) {
  if (!slides.length) return;
  slides[idx].classList.remove("active");
  idx = (i + slides.length) % slides.length;
  slides[idx].classList.add("active");
  renderDots();
  restartAuto();
}

function restartAuto() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => goTo(idx + 1), 5500);
}

prev?.addEventListener("click", () => goTo(idx - 1));
next?.addEventListener("click", () => goTo(idx + 1));

renderDots();
restartAuto();

// Swipe
let touchX = null;
carousel?.addEventListener(
  "touchstart",
  (e) => {
    touchX = e.touches?.[0]?.clientX ?? null;
  },
  { passive: true }
);
carousel?.addEventListener(
  "touchend",
  (e) => {
    if (touchX === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchX;
    const dx = endX - touchX;
    touchX = null;

    // threshold (arrasto minimo)
    if (Math.abs(dx) < 40) return;

    if (dx > 0) goTo(idx - 1);
    else goTo(idx + 1);
  },
  { passive: true }
);

// --------------------------------
// Search (debounce + Enter)
// --------------------------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const products = Array.from(document.querySelectorAll(".product"));

function applySearch() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  products.forEach((p) => {
    const name = (p.dataset.name || "").toLowerCase();
    p.style.display = name.includes(q) ? "block" : "none";
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const applySearchDebounced = debounce(applySearch, 180);

searchBtn?.addEventListener("click", applySearch);
searchInput?.addEventListener("input", applySearchDebounced);
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applySearch();
  if (e.key === "Escape") {
    searchInput.value = "";
    applySearch();
    searchInput.blur();
  }
});

// --------------------------------
// Cart badge (fake) + persist
// --------------------------------
const badge = document.getElementById("cartBadge");
let cartCount = Number(localStorage.getItem("amiz_cart_count") || 0);
if (badge) badge.textContent = String(cartCount);

function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1500);
}

document.querySelectorAll(".add").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    cartCount += 1;
    localStorage.setItem("amiz_cart_count", String(cartCount));
    if (badge) badge.textContent = String(cartCount);
    toast("Adicionado ao carrinho");
  });
});

// --------------------------------
// Modal produto (mensagem personalizada)
// --------------------------------
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalBack = document.getElementById("modalBack");

const mImg = document.getElementById("mImg");
const mTitle = document.getElementById("mTitle");
const mPrice = document.getElementById("mPrice");
const mWhats = document.getElementById("mWhats");

function openModalFromProduct(card) {
  const name = card.dataset.name || "Produto";
  const price = Number(card.dataset.price || 0);

  if (mImg) {
    mImg.src = card.dataset.img || "";
    mImg.alt = name;
  }
  if (mTitle) mTitle.textContent = name;

  const priceFmt = price > 0 ? `R$ ${price.toFixed(2).replace(".", ",")}` : "Consulte";
  if (mPrice) mPrice.textContent = priceFmt;

  // Mensagem padrao para qualquer roupa (personalizada com o item)
  const message =
    `Ola! Vim pelo site da AMIZ e tenho interesse nesta peca: ${name}. ` +
    `Valor: ${priceFmt}. Pode me ajudar com tamanho, disponibilidade e entrega?`;

  if (mWhats) mWhats.href = waLink(message);

  modal?.classList.add("show");
  modal?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal?.classList.remove("show");
  modal?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

products.forEach((p) => p.addEventListener("click", () => openModalFromProduct(p)));
modalOverlay?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);
modalBack?.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("show")) closeModal();
});

// --------------------------------
// Ajusta links fixos de WhatsApp (drawer + botao flutuante), caso voce mude o numero
// --------------------------------
function upgradeStaticWhatsLinks() {
  const selectors = [
    "a.wa-float",
    ".drawer-cta a.btn",
    "#contato a.btn[target='_blank']",
    ".hero a.btn[target='_blank']",
    ".hero-side a.btn[target='_blank']",
  ];
  const anchors = selectors.flatMap((sel) => Array.from(document.querySelectorAll(sel)));

  const baseMessage = "Ola! Vim pelo site da AMIZ e quero atendimento. Pode me ajudar?";

  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href.includes("wa.me/")) return;

    // Mantem o texto original se existir, senao aplica o padrao
    const hasText = href.includes("?text=");
    if (!hasText) a.setAttribute("href", waLink(baseMessage));

    // Se tiver texto, pelo menos garante o numero correto
    a.setAttribute("href", href.replace(/wa\.me\/\d+/, `wa.me/${WA_NUMBER}`));
  });
}

upgradeStaticWhatsLinks();
