export function applyBigSurFilter(sourceImg, targetEl, options = {}) {
  const {
    intensity = 100,
    targetColors = ['#a75d5a'],
    sigmas = [25],
    backgroundColor = '#8a8a8a',
    overlay = null
  } = options;

  const blend = Math.max(0, Math.min(1, intensity / 100));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = sourceImg.naturalWidth || sourceImg.width;
  const height = sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(sourceImg, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  function hexToRgb(hex) {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  function rgbToXyz(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x, y, z];
  }

  function xyzToLab(x, y, z) {
    const refX = 0.95047, refY = 1.0, refZ = 1.08883;
    x /= refX; y /= refY; z /= refZ;
    x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + 16 / 116;
    y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + 16 / 116;
    z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + 16 / 116;
    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return [L, a, b];
  }

  function rgbToLab(r, g, b) {
    const [x, y, z] = rgbToXyz(r, g, b);
    return xyzToLab(x, y, z);
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
        default:
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

  const targetLabs = targetColors.map(hex => {
    const [r, g, b] = hexToRgb(hex);
    return rgbToLab(r, g, b);
  });

  const [bgR, bgG, bgB] = hexToRgb(backgroundColor);
  const [bgH, bgS] = rgbToHsv(bgR, bgG, bgB);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const [L, a, bb] = rgbToLab(r, g, b);

    let mask = 0;
    for (let j = 0; j < targetLabs.length; j++) {
      const [tL, ta, tb] = targetLabs[j];
      const sigma = sigmas[j] || sigmas[0];
      const deltaE = Math.sqrt((L - tL) ** 2 + (a - ta) ** 2 + (bb - tb) ** 2);
      const currentMask = Math.exp(-(deltaE ** 2) / (2 * sigma * sigma));
      if (currentMask > mask) mask = currentMask;
    }

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const [br, bg2, bb2] = hsvToRgb(bgH, bgS, gray / 255);

    const blendedR = r * mask + br * (1 - mask);
    const blendedG = g * mask + bg2 * (1 - mask);
    const blendedB = b * mask + bb2 * (1 - mask);

    data[i] = Math.max(0, Math.min(255, r * (1 - blend) + blendedR * blend));
    data[i + 1] = Math.max(0, Math.min(255, g * (1 - blend) + blendedG * blend));
    data[i + 2] = Math.max(0, Math.min(255, b * (1 - blend) + blendedB * blend));
  }

  ctx.putImageData(imageData, 0, 0);

  function finalize() {
    targetEl.src = canvas.toDataURL();
  }

  if (overlay === 'BigSurGradient1') {
    const overlayImg = new Image();
    overlayImg.onload = () => {
      ctx.globalAlpha = 0.26;
      ctx.globalCompositeOperation = 'soft-light';
      ctx.drawImage(overlayImg, 0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      finalize();
    };
    overlayImg.src = 'template/BigSurGradient1.svg';
  } else {
    finalize();
  }
}
