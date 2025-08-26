// Vintage filter converted from Python implementation
// Applies a vintage look using color balance, inversion and soft light blending

function softLightChannel(base, blend) {
  base /= 255;
  blend /= 255;
  let res;
  if (blend < 0.5) {
    res = base - (1 - 2 * blend) * base * (1 - base);
  } else {
    res = base + (2 * blend - 1) * (Math.sqrt(base) - base);
  }
  return Math.max(0, Math.min(1, res)) * 255;
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
  const { intensity = 100 } = options;

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
  const opacity = 0.85;

  for (let i = 0; i < data.length; i += 4) {
    const r0 = data[i];
    const g0 = data[i + 1];
    const b0 = data[i + 2];

    let r2 = Math.max(0, r0 - 100);
    let g2 = g0;
    let b2 = b0;

    r2 = 255 - r2;
    g2 = 255 - g2;
    b2 = 255 - b2;

    let fr = softLightChannel(r0, r2);
    let fg = softLightChannel(g0, g2);
    let fb = softLightChannel(b0, b2);

    fr = fr * opacity + r0 * (1 - opacity);
    fg = fg * opacity + g0 * (1 - opacity);
    fb = fb * opacity + b0 * (1 - opacity);

    let [h, s, v] = rgbToHsv(fr, fg, fb);
    s = Math.min(1, s * 1.13);
    v = Math.min(1, v * 1.13);
    [fr, fg, fb] = hsvToRgb(h, s, v);

    const contrast = 1.13;
    fr = (fr - 128) * contrast + 128;
    fg = (fg - 128) * contrast + 128;
    fb = (fb - 128) * contrast + 128;

    fr -= 15;
    fg += 15;
    fb += 2;

    fr = Math.max(0, Math.min(255, fr));
    fg = Math.max(0, Math.min(255, fg));
    fb = Math.max(0, Math.min(255, fb));

    const r = r0 * (1 - intensityFactor) + fr * intensityFactor;
    const g = g0 * (1 - intensityFactor) + fg * intensityFactor;
    const b = b0 * (1 - intensityFactor) + fb * intensityFactor;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

