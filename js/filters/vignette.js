export function applyVignetteFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100 } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(sourceImg, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const strength = (intensity / 100) * 0.75; // maximum edge darkening

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vignette = 1 - strength * Math.pow(dist / maxDist, 2);
      const index = (y * width + x) * 4;
      data[index] *= vignette;
      data[index + 1] *= vignette;
      data[index + 2] *= vignette;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}
