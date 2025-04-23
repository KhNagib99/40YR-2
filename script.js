const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const download = document.getElementById('download');
const loading = document.getElementById('loading');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let userImage = null;
let userPanzoom = null;

const frame = new Image();
frame.src = 'assets/frame.png';

frame.onload = () => {
  drawEverything();
};

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = () => {
      userImage = img;

      const imageContainer = document.createElement('div');
      imageContainer.style.position = 'absolute';
      imageContainer.style.left = 0;
      imageContainer.style.top = 0;
      imageContainer.style.width = canvasWidth + 'px';
      imageContainer.style.height = canvasHeight + 'px';
      imageContainer.style.overflow = 'hidden';
      imageContainer.style.zIndex = 10;

      const imageElement = document.createElement('img');
      imageElement.src = img.src;
      imageElement.style.width = '100%';
      imageElement.style.height = 'auto';
      imageElement.style.touchAction = 'none';

      imageContainer.appendChild(imageElement);
      document.querySelector('.canvas-container').appendChild(imageContainer);

      if (userPanzoom) {
        userPanzoom.dispose();
      }
      userPanzoom = panzoom(imageElement, {
        bounds: true,
        zoomSpeed: 0.06,
        maxZoom: 3,
        minZoom: 0.5
      });

      drawEverything();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function drawEverything() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  if (userImage) {
    ctx.drawImage(userImage, 0, 0, canvasWidth, canvasHeight);
  }
  ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);
}

download.addEventListener('click', () => {
  if (!userImage) return alert('Please upload your photo first.');

  drawEverything();

  const link = document.createElement('a');
  link.download = 'framed-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
