export function applyBigSurFilter(sourceImg, targetEl, options = {}) {
  const {
    intensity = 100,
    colors = ['#a75d5a'],
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
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
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

  function rgbToLab(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    const xr = x / 0.95047;
    const yr = y / 1.0;
    const zr = z / 1.08883;
    const fx = xr > 0.008856 ? Math.cbrt(xr) : 7.787 * xr + 16 / 116;
    const fy = yr > 0.008856 ? Math.cbrt(yr) : 7.787 * yr + 16 / 116;
    const fz = zr > 0.008856 ? Math.cbrt(zr) : 7.787 * zr + 16 / 116;
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bLab = 200 * (fy - fz);
    return [L, a, bLab];
  }

  const targetsLab = colors.slice(0, sigmas.length).map(hex => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToLab(r, g, b);
  });

  const bgRgb = hexToRgb(backgroundColor);
  const [bgH, bgS] = rgbToHsv(bgRgb.r, bgRgb.g, bgRgb.b);

  for (let i = 0; i < data.length; i += 4) {
    const r0 = data[i];
    const g0 = data[i + 1];
    const b0 = data[i + 2];

    const [L, a, bLab] = rgbToLab(r0, g0, b0);
    let mask = 0;
    for (let j = 0; j < targetsLab.length; j++) {
      const [tL, ta, tb] = targetsLab[j];
      const sigma = sigmas[j];
      const dL = L - tL;
      const da = a - ta;
      const db = bLab - tb;
      const deltaE = Math.sqrt(dL * dL + da * da + db * db);
      const currentMask = Math.exp(-(deltaE * deltaE) / (2 * sigma * sigma));
      if (currentMask > mask) mask = currentMask;
    }

    const gray = 0.299 * r0 + 0.587 * g0 + 0.114 * b0;
    const [bgR, bgG, bgB] = hsvToRgb(bgH, bgS, gray / 255);

    const r1 = r0 * mask + bgR * (1 - mask);
    const g1 = g0 * mask + bgG * (1 - mask);
    const b1 = b0 * mask + bgB * (1 - mask);

    data[i] = r0 * (1 - blend) + r1 * blend;
    data[i + 1] = g0 * (1 - blend) + g1 * blend;
    data[i + 2] = b0 * (1 - blend) + b1 * blend;
  }

  ctx.putImageData(imageData, 0, 0);

  const finalize = () => {
    targetEl.src = canvas.toDataURL();
  };

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
    overlayImg.onerror = finalize;
    overlayImg.src = 'template/BigSurGradient1.svg';
  } else {
    finalize();
  }
}

