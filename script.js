const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let userImage = null;
let imageX = 0;
let imageY = 0;
let imageScale = 1;
let isDragging = false;
let dragStartX, dragStartY;

// Load Frame
const frame = new Image();
frame.src = "assets/frame.png";

frame.onload = () => {
  canvas.width = frame.width;
  canvas.height = frame.height;
  drawCanvas();
};

// Image Upload
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    userImage = img;

    // Fit to canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    imageScale = scale;

    // Center image
    imageX = (canvas.width - img.width * scale) / 2;
    imageY = (canvas.height - img.height * scale) / 2;

    drawCanvas();
  };
  img.src = URL.createObjectURL(file);
});

// Draw everything
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage) {
    ctx.drawImage(
      userImage,
      imageX,
      imageY,
      userImage.width * imageScale,
      userImage.height * imageScale
    );
  }

  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

// Mouse drag
canvas.addEventListener("mousedown", function (e) {
  isDragging = true;
  dragStartX = e.offsetX - imageX;
  dragStartY = e.offsetY - imageY;
});

canvas.addEventListener("mousemove", function (e) {
  if (isDragging && userImage) {
    imageX = e.offsetX - dragStartX;
    imageY = e.offsetY - dragStartY;
    drawCanvas();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

// Scroll zoom (desktop)
canvas.addEventListener("wheel", function (e) {
  if (!userImage) return;
  e.preventDefault();

  const zoom = e.deltaY < 0 ? 1.05 : 0.95;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const newScale = imageScale * zoom;
  const scaleFactor = newScale / imageScale;

  imageX = mouseX - (mouseX - imageX) * scaleFactor;
  imageY = mouseY - (mouseY - imageY) * scaleFactor;
  imageScale = newScale;

  drawCanvas();
});

// Touch support (mobile pinch-zoom)
let lastTouchDistance = null;

canvas.addEventListener("touchstart", function (e) {
  if (e.touches.length === 1) {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    dragStartX = e.touches[0].clientX - rect.left - imageX;
    dragStartY = e.touches[0].clientY - rect.top - imageY;
  } else if (e.touches.length === 2) {
    isDragging = false;
    lastTouchDistance = getTouchDistance(e.touches);
  }
});

canvas.addEventListener("touchmove", function (e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  if (e.touches.length === 1 && isDragging && userImage) {
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    imageX = x - dragStartX;
    imageY = y - dragStartY;
    drawCanvas();
  } else if (e.touches.length === 2 && userImage) {
    const newDist = getTouchDistance(e.touches);
    if (lastTouchDistance) {
      const zoom = newDist / lastTouchDistance;
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      const newScale = imageScale * zoom;
      const scaleFactor = newScale / imageScale;

      imageX = centerX - (centerX - imageX) * scaleFactor;
      imageY = centerY - (centerY - imageY) * scaleFactor;
      imageScale = newScale;

      drawCanvas();
    }
    lastTouchDistance = newDist;
  }
});

canvas.addEventListener("touchend", function () {
  isDragging = false;
  lastTouchDistance = null;
});

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Download high-res PNG
document.getElementById("downloadBtn").addEventListener("click", function () {
  const link = document.createElement("a");
  link.download = "IDLC-Photo.png";
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
});
