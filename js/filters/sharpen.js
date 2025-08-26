export function applySharpenFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100 } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;

  // Draw the original image
  ctx.drawImage(sourceImg, 0, 0, width, height);
  const originalData = ctx.getImageData(0, 0, width, height);

  // Create a blurred version of the image using Gaussian blur
  const blurCanvas = document.createElement('canvas');
  const blurCtx = blurCanvas.getContext('2d');
  blurCanvas.width = width;
  blurCanvas.height = height;
  const blurRadius = 2; // typical radius for professional unsharp masking
  blurCtx.filter = `blur(${blurRadius}px)`;
  blurCtx.drawImage(sourceImg, 0, 0, width, height);
  const blurredData = blurCtx.getImageData(0, 0, width, height);

  const data = originalData.data;
  const blurData = blurredData.data;
  const amount = (intensity / 100) * 1.5; // scale sharpening amount

  for (let i = 0; i < data.length; i += 4) {
    // Unsharp mask: add scaled high frequency detail
    data[i] = clamp(data[i] + (data[i] - blurData[i]) * amount);
    data[i + 1] = clamp(data[i + 1] + (data[i + 1] - blurData[i + 1]) * amount);
    data[i + 2] = clamp(data[i + 2] + (data[i + 2] - blurData[i + 2]) * amount);
  }

  ctx.putImageData(originalData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}
