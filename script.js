const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");
const frame = new Image();
frame.src = "assets/frame.png";

let photo = null;
let photoScale = 1;
let photoX = 0;
let photoY = 0;
let isDragging = false;
let startX, startY;

document.getElementById("photoUpload").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = function (event) {
    photo = new Image();
    photo.onload = () => {
      draw();
    };
    photo.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const dx = e.offsetX - startX;
    const dy = e.offsetY - startY;
    photoX += dx;
    photoY += dy;
    startX = e.offsetX;
    startY = e.offsetY;
    draw();
  }
});

canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.05 : 0.95;
  photoScale *= zoom;
  draw();
});

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);

let lastTouchDist = null;

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    lastTouchDist = getTouchDist(e);
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1 && isDragging) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    photoX += dx;
    photoY += dy;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    draw();
  } else if (e.touches.length === 2) {
    const newDist = getTouchDist(e);
    if (lastTouchDist) {
      const zoom = newDist / lastTouchDist;
      photoScale *= zoom;
    }
    lastTouchDist = newDist;
    draw();
  }
}

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (photo) {
    const w = photo.width * photoScale;
    const h = photo.height * photoScale;
    ctx.drawImage(photo, photoX, photoY, w, h);
  }
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "framed-photo.png";
  link.href = canvas.toDataURL();
  link.click();
});