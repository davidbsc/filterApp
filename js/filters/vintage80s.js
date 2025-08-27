// Vintage filter converted from Python implementation
// Applies a classic vintage color grading with soft light blend and color tweaks

function softLight(base, blend) {
  const b = base / 255;
  const d = blend / 255;
  let result;
  if (d < 0.5) {
    result = b - (1 - 2 * d) * b * (1 - b);
  } else {
    result = b + (2 * d - 1) * (Math.sqrt(b) - b);
  }
  return Math.max(0, Math.min(255, result * 255));
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs(hh % 2 - 1));
  let r1, g1, b1;
  if (hh >= 0 && hh < 1) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hh < 2) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hh < 3) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hh < 4) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hh < 5) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }
  const m = v - c;
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

export function applyVintageFilter(sourceImg, targetEl, options = {}) {
  const {
    intensity = 100,
    alpha = 0,
    beta = 0,
    gamma = 0,
    delta = 0
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const basePixels = imageData.data;
  const len = basePixels.length;
  const dupPixels = new Uint8ClampedArray(basePixels);

  // Step 2.2: decrease red channel (Cyan +100)
  const cyanAdjustment = 100 + alpha;
  for (let i = 0; i < len; i += 4) {
    dupPixels[i] = Math.max(0, dupPixels[i] - cyanAdjustment);
  }
  // Step 2.3: invert colors
  for (let i = 0; i < len; i += 4) {
    dupPixels[i] = 255 - dupPixels[i];
    dupPixels[i + 1] = 255 - dupPixels[i + 1];
    dupPixels[i + 2] = 255 - dupPixels[i + 2];
  }

  // Step 2.4: soft light blend
  const fusedPixels = new Uint8ClampedArray(len);
  for (let i = 0; i < len; i += 4) {
    fusedPixels[i] = softLight(basePixels[i], dupPixels[i]);
    fusedPixels[i + 1] = softLight(basePixels[i + 1], dupPixels[i + 1]);
    fusedPixels[i + 2] = softLight(basePixels[i + 2], dupPixels[i + 2]);
    fusedPixels[i + 3] = basePixels[i + 3];
  }

  // Blend with original using opacity 0.85
  const opacity = 0.85;
  for (let i = 0; i < len; i += 4) {
    fusedPixels[i] = fusedPixels[i] * opacity + basePixels[i] * (1 - opacity);
    fusedPixels[i + 1] = fusedPixels[i + 1] * opacity + basePixels[i + 1] * (1 - opacity);
    fusedPixels[i + 2] = fusedPixels[i + 2] * opacity + basePixels[i + 2] * (1 - opacity);
  }

  // Step 2.5: saturation, brightness, contrast +13%
  const satFactor = 1.13 + (beta / 50) * 0.5;
  const brightFactor = 1.13 + (gamma / 50) * 0.5;
  const contrastFactor = 1.13 + (delta / 50) * 0.5;
  for (let i = 0; i < len; i += 4) {
    let r = fusedPixels[i];
    let g = fusedPixels[i + 1];
    let b = fusedPixels[i + 2];

    // Saturation
    let [h, s, v] = rgbToHsv(r, g, b);
    s = Math.min(1, s * satFactor);
    [r, g, b] = hsvToRgb(h, s, v);

    // Brightness
    r = Math.min(255, r * brightFactor);
    g = Math.min(255, g * brightFactor);
    b = Math.min(255, b * brightFactor);

    // Contrast
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Step 2.6: color balance
    r = Math.max(0, Math.min(255, r - 15));
    g = Math.max(0, Math.min(255, g + 15));
    b = Math.max(0, Math.min(255, b + 2));

    fusedPixels[i] = r;
    fusedPixels[i + 1] = g;
    fusedPixels[i + 2] = b;
  }

  // Blend with original image according to intensity
  const intensityFactor = intensity / 100;
  for (let i = 0; i < len; i += 4) {
    basePixels[i] = Math.max(0, Math.min(255, basePixels[i] * (1 - intensityFactor) + fusedPixels[i] * intensityFactor));
    basePixels[i + 1] = Math.max(0, Math.min(255, basePixels[i + 1] * (1 - intensityFactor) + fusedPixels[i + 1] * intensityFactor));
    basePixels[i + 2] = Math.max(0, Math.min(255, basePixels[i + 2] * (1 - intensityFactor) + fusedPixels[i + 2] * intensityFactor));
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

