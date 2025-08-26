export function applyCoolToneFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100, contrast = 0, brightness = 0 } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const intensityFactor = intensity / 100;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessFactor = Math.max(0, 1 + brightness / 100);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const nr = r * (1 - 0.2 * intensityFactor);
    const ng = g * (1 - 0.1 * intensityFactor);
    const nb = b + (255 - b) * 0.25 * intensityFactor;

    r = r * (1 - intensityFactor) + nr * intensityFactor;
    g = g * (1 - intensityFactor) + ng * intensityFactor;
    b = b * (1 - intensityFactor) + nb * intensityFactor;

    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    r *= brightnessFactor;
    g *= brightnessFactor;
    b *= brightnessFactor;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

