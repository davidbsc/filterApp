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

  const overlay = (base, blend) => {
    const b = base / 255;
    const d = blend / 255;
    const result = b < 0.5 ? 2 * b * d : 1 - 2 * (1 - b) * (1 - d);
    return result * 255;
  };

  for (let i = 0; i < data.length; i += 4) {
    const r0 = data[i];
    const g0 = data[i + 1];
    const b0 = data[i + 2];

    const gray = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;

    let nr = overlay(r0, gray);
    let ng = overlay(g0, gray);
    let nb = overlay(b0, gray);

    nr = r0 * (1 - intensityFactor) + nr * intensityFactor;
    ng = g0 * (1 - intensityFactor) + ng * intensityFactor;
    nb = b0 * (1 - intensityFactor) + nb * intensityFactor;

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
