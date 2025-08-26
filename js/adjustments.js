export function applyBrightnessContrast(sourceImg, targetEl, options = {}) {
  const { brightness = 0, contrast = 0 } = options;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightnessOffset = 255 * (brightness / 100);
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(contrastFactor * (data[i] - 128) + 128 + brightnessOffset);
    data[i + 1] = clamp(contrastFactor * (data[i + 1] - 128) + 128 + brightnessOffset);
    data[i + 2] = clamp(contrastFactor * (data[i + 2] - 128) + 128 + brightnessOffset);
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}
