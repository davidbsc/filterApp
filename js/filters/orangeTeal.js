// Orange & Teal filter implementation converted from Python
// Builds LUTs and applies the filter to an image element using canvas

function buildOrangeTealLUT(
  sigmaH = 15,
  warmH = 15,
  coolH = 90,
  satBoostWarm = 1.45,
  satBoostCool = 1.20
) {
  const hueLUT = new Uint8Array(180);
  const satLUT = new Float32Array(180);
  const twoSigma2 = 2 * sigmaH * sigmaH;
  for (let h = 0; h < 180; h++) {
    const dw = Math.min(Math.abs(h - warmH), 180 - Math.abs(h - warmH));
    const dc = Math.min(Math.abs(h - coolH), 180 - Math.abs(h - coolH));
    let wWarm = Math.exp(-(dw * dw) / twoSigma2);
    let wCool = Math.exp(-(dc * dc) / twoSigma2);
    if (wWarm + wCool < 1e-6) {
      hueLUT[h] = h;
      satLUT[h] = 1.0;
    } else {
      const wSum = wWarm + wCool;
      wWarm /= wSum;
      wCool = 1.0 - wWarm;
      hueLUT[h] = Math.round(wWarm * warmH + wCool * coolH) % 180;
      satLUT[h] = wWarm * satBoostWarm + wCool * satBoostCool;
    }
  }
  return { hueLUT, satLUT };
}

const { hueLUT, satLUT } = buildOrangeTealLUT();

function smoothContrast(v, midBoost = 1.05, shadowMul = 0.93, hiMul = 1.06) {
  const t = v / 255;
  const smooth = t * t * (3 - 2 * t);
  const boost = shadowMul + (hiMul - shadowMul) * smooth;
  const vNew = v * boost * midBoost;
  return Math.max(0, Math.min(255, Math.round(vNew)));
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 180, s, v];
}

function hsvToRgb(h, s, v) {
  const h6 = (h / 180) * 6;
  const c = v * s;
  const x = c * (1 - Math.abs(h6 % 2 - 1));
  const m = v - c;
  let r, g, b;
  if (0 <= h6 && h6 < 1) { r = c; g = x; b = 0; }
  else if (h6 < 2) { r = x; g = c; b = 0; }
  else if (h6 < 3) { r = 0; g = c; b = x; }
  else if (h6 < 4) { r = 0; g = x; b = c; }
  else if (h6 < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function applyOrangeTeal(imageEl, intensity = 1.0) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = imageEl.naturalWidth || imageEl.width;
  const h = imageEl.naturalHeight || imageEl.height;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(imageEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let [hh, s, v] = rgbToHsv(r, g, b);
    const idx = Math.round(hh) % 180;
    hh = hueLUT[idx];
    s = Math.min(s * satLUT[idx], 1);
    v = smoothContrast(v * 255) / 255;
    const [nr, ng, nb] = hsvToRgb(hh, s, v);
    data[i] = nr * intensity + r * (1 - intensity);
    data[i + 1] = ng * intensity + g * (1 - intensity);
    data[i + 2] = nb * intensity + b * (1 - intensity);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
