export function applyCaliforniaFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100 } = options;
  // TODO: Implement California effect
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);
  targetEl.src = canvas.toDataURL();
}
