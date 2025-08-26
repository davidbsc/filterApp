export function applyHighContrastFilter(sourceImg, targetEl, options = {}) {
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

  function overlay(base, blend) {
    if (base < 128) {
      return (2 * base * blend) / 255;
    }
    return 255 - (2 * (255 - base) * (255 - blend)) / 255;
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    let nr = overlay(r, gray);
    let ng = overlay(g, gray);
    let nb = overlay(b, gray);

    nr = r * (1 - intensityFactor) + nr * intensityFactor;
    ng = g * (1 - intensityFactor) + ng * intensityFactor;
    nb = b * (1 - intensityFactor) + nb * intensityFactor;

    nr = contrastFactor * (nr - 128) + 128;
    ng = contrastFactor * (ng - 128) + 128;
    nb = contrastFactor * (nb - 128) + 128;

    nr *= brightnessFactor;
    ng *= brightnessFactor;
    nb *= brightnessFactor;

    data[i] = Math.max(0, Math.min(255, nr));
    data[i + 1] = Math.max(0, Math.min(255, ng));
    data[i + 2] = Math.max(0, Math.min(255, nb));
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}
