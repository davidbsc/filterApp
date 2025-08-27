// Orange & Teal filter converted from Python implementation
// Applies a smooth orange and teal color grading to an image element

// Build lookup tables for hue shift and saturation boost (version 1)
function buildOrangeTealLUT(
  sigmaH = 15,
  warmH = 17, //original 15
  coolH = 94, //original 90
  satBoostWarm = 1.45,
  satBoostCool = 1.20
) {
  const hueLut = new Array(180).fill(0);
  const satLut = new Array(180).fill(1.0);
  const twoSigma2 = 2 * sigmaH * sigmaH;

  for (let h = 0; h < 180; h++) {
    const dw = Math.min(Math.abs(h - warmH), 180 - Math.abs(h - warmH));
    const dc = Math.min(Math.abs(h - coolH), 180 - Math.abs(h - coolH));

    const wWarm = Math.exp(-(dw * dw) / twoSigma2);
    const wCool = Math.exp(-(dc * dc) / twoSigma2);

    if (wWarm + wCool < 1e-6) {
      hueLut[h] = h;
      satLut[h] = 1.0;
    } else {
      const wSum = wWarm + wCool;
      const wWarmNorm = wWarm / wSum;
      const wCoolNorm = 1.0 - wWarmNorm;

      hueLut[h] = Math.round(wWarmNorm * warmH + wCoolNorm * coolH) % 180;
      satLut[h] = wWarmNorm * satBoostWarm + wCoolNorm * satBoostCool;
    }
  }

  return { hueLut, satLut };
}

// Build lookup tables for hue shift and saturation boost (version 2)
function buildOrangeTealLUTv2(
  sigmaH = 20,
  warmH = 17, //15
  coolH = 94, //90
  pinkH = 140, //150
  satBoostWarm = 1.45,
  satBoostCool = 1.20,
  satBoostPink = 1.25
) {
  const hueLut = new Array(180).fill(0);
  const satLut = new Array(180).fill(1.0);
  const twoSigma2 = 2 * sigmaH * sigmaH;

  const warmRad = (warmH * 2 * Math.PI) / 180;
  const coolRad = (coolH * 2 * Math.PI) / 180;
  const pinkRad = (pinkH * 2 * Math.PI) / 180;

  for (let h = 0; h < 180; h++) {
    const dw = Math.min(Math.abs(h - warmH), 180 - Math.abs(h - warmH));
    const dc = Math.min(Math.abs(h - coolH), 180 - Math.abs(h - coolH));
    const dp = Math.min(Math.abs(h - pinkH), 180 - Math.abs(h - pinkH));

    let wWarm = Math.exp(-(dw * dw) / twoSigma2);
    let wCool = Math.exp(-(dc * dc) / twoSigma2);
    let wPink = Math.exp(-(dp * dp) / twoSigma2);

    const wSum = wWarm + wCool + wPink;

    if (wSum < 1e-6) {
      hueLut[h] = h;
      satLut[h] = 1.0;
    } else {
      wWarm /= wSum;
      wCool /= wSum;
      wPink /= wSum;

      const avgX =
        wWarm * Math.cos(warmRad) +
        wCool * Math.cos(coolRad) +
        wPink * Math.cos(pinkRad);
      const avgY =
        wWarm * Math.sin(warmRad) +
        wCool * Math.sin(coolRad) +
        wPink * Math.sin(pinkRad);

      let newHueDeg = (Math.atan2(avgY, avgX) * 180) / Math.PI;
      if (newHueDeg < 0) newHueDeg += 360;
      const newHue = Math.round(newHueDeg / 2) % 180;

      hueLut[h] = newHue;
      satLut[h] =
        wWarm * satBoostWarm + wCool * satBoostCool + wPink * satBoostPink;
    }
  }

  return { hueLut, satLut };
}

const LUT_V1 = buildOrangeTealLUT();
const LUT_V2 = buildOrangeTealLUTv2();

// Smooth contrast adjustment similar to the Python _smooth_contrast
function smoothContrast(v, midBoost = 1.05, shadowMul = 0.93, hiMul = 1.06) {
  const t = v; // v expected in range 0-1
  const smooth = t * t * (3.0 - 2.0 * t);
  const boost = shadowMul + (hiMul - shadowMul) * smooth;
  let vNew = v * boost * midBoost;
  return Math.min(1, Math.max(0, vNew));
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0; // achromatic
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

export function applyOrangeTealFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100, contrast = 0, brightness = 0, version = 1 } = options;

  const { hueLut: HUE_LUT, satLut: SAT_LUT } =
    version === 2 ? LUT_V2 : LUT_V1;

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

  for (let i = 0; i < data.length; i += 4) {
    const r0 = data[i];
    const g0 = data[i + 1];
    const b0 = data[i + 2];

    let [h, s, v] = rgbToHsv(r0, g0, b0);
    const hIdx = Math.floor(h / 2);
    const newHueIdx = HUE_LUT[hIdx];
    const satMult = SAT_LUT[newHueIdx];
    const newHue = newHueIdx * 2;
    const newSat = Math.min(1, s * satMult);
    const newVal = smoothContrast(v);
    const [nr, ng, nb] = hsvToRgb(newHue, newSat, newVal);

    let r = r0 * (1 - intensityFactor) + nr * intensityFactor;
    let g = g0 * (1 - intensityFactor) + ng * intensityFactor;
    let b = b0 * (1 - intensityFactor) + nb * intensityFactor;

    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    r *= brightnessFactor;
    g *= brightnessFactor;
    b *= brightnessFactor;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}

