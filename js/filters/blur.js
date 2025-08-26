export function applyBlurFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100 } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;

  const maxBlur = 10;
  const blurRadius = (intensity / 100) * maxBlur;
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(sourceImg, 0, 0);
  ctx.filter = 'none';

  targetEl.src = canvas.toDataURL();
}

