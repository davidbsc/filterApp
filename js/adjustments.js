export function applyBrightnessContrast(sourceImg, targetEl, brightness = 0, contrast = 0) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessOffset = 255 * (brightness / 100);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128 + brightnessOffset));
    data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128 + brightnessOffset));
    data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128 + brightnessOffset));
  }

  ctx.putImageData(imageData, 0, 0);
  const dataURL = canvas.toDataURL();
  targetEl.src = dataURL;
  return dataURL;
}
