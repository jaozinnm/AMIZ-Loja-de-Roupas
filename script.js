// Ano
document.getElementById("year").textContent = new Date().getFullYear();

// Drawer mobile
const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");
const overlay = document.getElementById("drawerOverlay");

function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("show");
  burger.setAttribute("aria-expanded", "true");
}
function hideDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
  burger.setAttribute("aria-expanded", "false");
}

burger?.addEventListener("click", openDrawer);
closeDrawer?.addEventListener("click", hideDrawer);
overlay?.addEventListener("click", hideDrawer);

drawer?.querySelectorAll("a").forEach(a => a.addEventListener("click", hideDrawer));

// Carousel
const slides = Array.from(document.querySelectorAll(".slide"));
const dotsWrap = document.getElementById("dots");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let idx = 0;
let timer = null;

function renderDots() {
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

// Search (filtra pelo nome)
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const products = Array.from(document.querySelectorAll(".product"));

function applySearch() {
  const q = (searchInput.value || "").trim().toLowerCase();
  products.forEach(p => {
    const name = (p.dataset.name || "").toLowerCase();
    p.style.display = name.includes(q) ? "block" : "none";
  });
}

searchBtn?.addEventListener("click", applySearch);
searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applySearch();
});

// Cart badge (fake)
let cartCount = 0;
const badge = document.getElementById("cartBadge");
document.querySelectorAll(".add").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    cartCount += 1;
    badge.textContent = cartCount;
  });
});

// Modal produto
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

  mImg.src = card.dataset.img || "";
  mImg.alt = name;
  mTitle.textContent = name;
  mPrice.textContent = `R$ ${price.toFixed(2).replace(".", ",")}`;

  const text = encodeURIComponent(`Olá! Quero comprar: ${name} (R$ ${price.toFixed(2).replace(".", ",")}).`);
  mWhats.href = `https://wa.me/558199699995?text=${text}`;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

products.forEach(p => p.addEventListener("click", () => openModalFromProduct(p)));
modalOverlay?.addEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModal);
modalBack?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});
