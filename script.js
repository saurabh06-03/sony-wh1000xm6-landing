const FRAME_COUNT = 240;
const FRAME_FOLDER = "assets/images";
const CANVAS_BG = "#050505";

const canvas = document.getElementById("productCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const story = document.getElementById("story");
const nav = document.getElementById("topNav");
const specGrid = document.getElementById("specGrid");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

const beats = {
  engineering: document.querySelector('[data-beat="engineering"]'),
  noise: document.querySelector('[data-beat="noise"]'),
  sound: document.querySelector('[data-beat="sound"]'),
  cta: document.querySelector('[data-beat="cta"]')
};

const images = new Array(FRAME_COUNT);
let targetFrame = 0;
let renderedFrame = 0;
let scrollProgress = 0;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function beatOpacity(progress, start, end) {
  const fadeIn = smoothstep(start - 0.05, start + 0.03, progress);
  const fadeOut = 1 - smoothstep(end - 0.04, end + 0.03, progress);
  return clamp(fadeIn * fadeOut, 0, 1);
}

function framePath(index) {
  const frame = String(index + 1).padStart(3, "0");
  return `assets/images/ezgif-frame-${frame}.jpg`;


}

function preloadFrames() {
  for (let i = 0; i < FRAME_COUNT; i += 1) {
    const img = new Image();
    img.src = framePath(i);
    img.decoding = "async";
    img.onload = () => {
      if (i === 0) drawFrame(0);
    };
    images[i] = img;
  }
}

function loadedImage(index) {
  if (images[index] && images[index].complete && images[index].naturalWidth > 0) return images[index];
  for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
    const back = index - offset;
    const front = index + offset;
    if (back >= 0 && images[back] && images[back].complete && images[back].naturalWidth > 0) return images[back];
    if (front < FRAME_COUNT && images[front] && images[front].complete && images[front].naturalWidth > 0) return images[front];
  }
  return null;
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFrame(index) {
  const image = loadedImage(clamp(index, 0, FRAME_COUNT - 1));

  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  if (!image) return;

  const scale = Math.min(window.innerWidth / image.naturalWidth, window.innerHeight / image.naturalHeight) * 1.05;
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const x = (window.innerWidth - drawW) * 0.5;
  const y = (window.innerHeight - drawH) * 0.5;

  ctx.drawImage(image, x, y, drawW, drawH);
}

function setBeatStyle(element, opacity) {
  if (!element) return;
  element.style.opacity = opacity.toFixed(3);
  element.style.setProperty("--lift", `${((1 - opacity) * 16).toFixed(2)}px`);
}

function updateBeats(progress) {
  setBeatStyle(beats.engineering, beatOpacity(progress, 0.12, 0.42));
  setBeatStyle(beats.noise, beatOpacity(progress, 0.38, 0.66));
  setBeatStyle(beats.sound, beatOpacity(progress, 0.62, 0.86));
  setBeatStyle(beats.cta, beatOpacity(progress, 0.84, 1.02));
}

function updateProgress() {
  const rect = story.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  scrollProgress = clamp(-rect.top / total, 0, 1);
  targetFrame = scrollProgress * (FRAME_COUNT - 1);
}

function updateNav() {
  nav.classList.toggle("scrolled", window.scrollY > 24);
}

function animate() {
  renderedFrame += (targetFrame - renderedFrame) * 0.1;
  drawFrame(Math.round(renderedFrame));
  updateBeats(scrollProgress);
  requestAnimationFrame(animate);
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node && value) node.textContent = value;
}

function renderSpecs(specs) {
  specGrid.innerHTML = specs
    .map((spec) => `<article class="spec-card"><h4>${spec.key}</h4><p>${spec.value}</p></article>`)
    .join("");
}

function loadStaticContent() {
  const product = {
    brand: "Sony",
    name: "WH-1000XM6",
    tagline: "Silence, perfected.",
    description: "Flagship wireless noise cancelling, re-engineered for a world that never stops.",
    cta: "Experience WH-1000XM6"
  };

  const features = {
    engineering: {
      title: "Precision-engineered for silence.",
      body: "Custom drivers, sealed acoustic chambers, and optimized airflow deliver studio-grade clarity."
    },
    noise: {
      title: "Adaptive noise cancelling, redefined.",
      body: "Real-time noise analysis adapts instantly to your environment for uninterrupted listening."
    },
    sound: {
      title: "Immersive, lifelike sound.",
      body: "AI upscaling restores depth and detail to compressed tracks for richer, more natural playback."
    }
  };

  const specs = [
    { key: "Battery Life", value: "Up to 40 hours with active noise cancelling" },
    { key: "Drivers", value: "40mm high-resolution custom drivers" },
    { key: "Weight", value: "Approx. 250g lightweight comfort frame" },
    { key: "Bluetooth Version", value: "Bluetooth 5.4 with multipoint connection" }
  ];

  setText("heroTitle", `${product.brand} ${product.name}`);
  setText("heroTagline", product.tagline);
  setText("heroDescription", product.description);
  setText("heroCtaNav", product.cta);
  setText("engineeringTitle", features.engineering.title);
  setText("engineeringBody", features.engineering.body);
  setText("noiseTitle", features.noise.title);
  setText("noiseBody", features.noise.body);
  setText("soundTitle", features.sound.title);
  setText("soundBody", features.sound.body);
  renderSpecs(specs);
}

function initContactForm() {
  if (!contactForm || !formStatus) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Saved locally. Connect a backend later to submit requests.";
    contactForm.reset();
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawFrame(Math.round(renderedFrame));
});

window.addEventListener(
  "scroll",
  () => {
    updateProgress();
    updateNav();
  },
  { passive: true }
);

(async function init() {
  resizeCanvas();
  preloadFrames();
  updateProgress();
  updateNav();
  loadStaticContent();
  initContactForm();
  animate();
})();
