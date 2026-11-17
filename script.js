// theme toggle {
const root = document.documentElement;
const button = document.querySelector("#theme-toggle");

root.style.colorScheme = localStorage.getItem("theme") || "dark";

button.addEventListener("click", () => {
  const theme =
    getComputedStyle(root).colorScheme === "dark" ? "light" : "dark";

  root.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
});

// since we have js, show the light/dark button.
button.style.display = "block";
document.documentElement.style.scrollbarWidth = "none";
// }

// ascii scrollbar {
const progress = document.querySelector("#scroll-progress");
const mobile = matchMedia("(max-width: 48rem)");

// determine scrollbar character count
const measure = document.createElement("canvas").getContext("2d");

function updateProgress() {
  const font = getComputedStyle(progress);
  measure.font = `${font.fontSize} ${font.fontFamily}`;

  const characterWidth = measure.measureText("-").width;
  const lineHeight = parseFloat(font.lineHeight);
  const count = mobile.matches
    ? Math.max(1, Math.floor((window.innerWidth * 0.9) / characterWidth))
    : Math.max(1, Math.floor((window.innerHeight * 0.9) / lineHeight));

  const maxScroll = root.scrollHeight - root.clientHeight;
  progress.style.display = maxScroll <= 0 ? "none" : "";
  const fraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const position = Math.round(Math.max(0, Math.min(1, fraction)) * (count - 1));

  const cells = Array.from({ length: count }, (_, i) => {
    if (i === position) return mobile.matches ? ">" : "v";
    if (i < position) return mobile.matches ? "=" : "#";
    return mobile.matches ? "-" : "|";
  });

  progress.textContent = cells.join(mobile.matches ? "" : "\n");
}

function scrollToPointer(event) {
  const bounds = progress.getBoundingClientRect();

  const fraction = mobile.matches
    ? (event.clientX - bounds.left) / bounds.width
    : (event.clientY - bounds.top) / bounds.height;

  const position = Math.max(0, Math.min(1, fraction));
  const maxScroll = root.scrollHeight - root.clientHeight;

  window.scrollTo(0, position * maxScroll);
}

progress.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;

  progress.setPointerCapture(event.pointerId);
  scrollToPointer(event);
});

progress.addEventListener("pointermove", (event) => {
  if (progress.hasPointerCapture(event.pointerId)) {
    scrollToPointer(event);
  }
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

// }
