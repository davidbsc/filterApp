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

// Build lookup tables for hue shift and saturation boost (version 3)
// Build lookup tables for hue shift and saturation boost (versione 3 MIGLIORATA)
//Orange & Pink
function buildOrangeTealLUTv4(
  sigmaH = 20,
  warmH = 17,
  coolH = 94,
  pinkH = 140,
  // NUOVI PARAMETRI per la mappatura verde -> viola
  greenSourceH = 90,   // Tonalità di verde da cui partire (centro della sfumatura)
  purpleTargetH = 164, // Tonalità di viola di destinazione (327 / 2)
  satBoostWarm = 1.45,
  satBoostCool = 1.20,
  satBoostPink = 1.25,
  satBoostPurple = 1.4 // Boost di saturazione per il nuovo viola
) {
  const hueLut = new Array(180).fill(0);
  const satLut = new Array(180).fill(1.0);
  const twoSigma2 = 2 * sigmaH * sigmaH;

  const warmRad = (warmH * 2 * Math.PI) / 180;
  const coolRad = (coolH * 2 * Math.PI) / 180;
  const pinkRad = (pinkH * 2 * Math.PI) / 180;
  const purpleRad = (purpleTargetH * 2 * Math.PI) / 180; // NUOVO: Radiani per il viola

  for (let h = 0; h < 180; h++) {
    const dw = Math.min(Math.abs(h - warmH), 180 - Math.abs(h - warmH));
    const dc = Math.min(Math.abs(h - coolH), 180 - Math.abs(h - coolH));
    const dp = Math.min(Math.abs(h - pinkH), 180 - Math.abs(h - pinkH));
    const dg = Math.min(Math.abs(h - greenSourceH), 180 - Math.abs(h - greenSourceH)); // NUOVO: calcolo distanza dal verde

    let wWarm = Math.exp(-(dw * dw) / twoSigma2);
    let wCool = Math.exp(-(dc * dc) / twoSigma2);
    let wPink = Math.exp(-(dp * dp) / twoSigma2);
    let wGreen = Math.exp(-(dg * dg) / twoSigma2); // NUOVO: calcolo peso per il verde

    // Se la tonalità è molto vicina al verde, diamo più importanza a quella mappatura
    if (h >= 60 && h <= 120) {
        wGreen *= 1.5;
    }

    const wSum = wWarm + wCool + wPink + wGreen; // NUOVO: aggiungi il peso del verde

    if (wSum < 1e-6) {
      hueLut[h] = h;
      satLut[h] = 1.0;
    } else {
      wWarm /= wSum;
      wCool /= wSum;
      wPink /= wSum;
      wGreen /= wSum; // NUOVO: normalizza il peso del verde

      const avgX =
        wWarm * Math.cos(warmRad) +
        wCool * Math.cos(coolRad) +
        wPink * Math.cos(pinkRad) +
        wGreen * Math.cos(purpleRad); // NUOVO: aggiungi il viola alla media
      const avgY =
        wWarm * Math.sin(warmRad) +
        wCool * Math.sin(coolRad) +
        wPink * Math.sin(pinkRad) +
        wGreen * Math.sin(purpleRad); // NUOVO: aggiungi il viola alla media

      let newHueDeg = (Math.atan2(avgY, avgX) * 180) / Math.PI;
      if (newHueDeg < 0) newHueDeg += 360;
      const newHue = Math.round(newHueDeg / 2) % 180;

      hueLut[h] = newHue;
      satLut[h] =
        wWarm * satBoostWarm +
        wCool * satBoostCool +
        wPink * satBoostPink +
        wGreen * satBoostPurple; // NUOVO: aggiungi il boost di saturazione per il viola
    }
  }

  return { hueLut, satLut };
}
function buildOrangeTealLUTv3(
  sigmaH = 20,
  warmH = 17,
  coolH = 94,
  pinkH = 140,
  greenSourceH = 60,
  purpleTargetH = 164,
  satBoostWarm = 1.45,
  satBoostCool = 1.20,
  satBoostPink = 1.25,
  satBoostPurple = 1.4
) {
  const hueLut = new Array(180).fill(0);
  const satLut = new Array(180).fill(1.0);
  const twoSigma2 = 2 * sigmaH * sigmaH;

  const warmRad = (warmH * 2 * Math.PI) / 180;
  const coolRad = (coolH * 2 * Math.PI) / 180;
  const pinkRad = (pinkH * 2 * Math.PI) / 180;
  const purpleRad = (purpleTargetH * 2 * Math.PI) / 180;

  for (let h = 0; h < 180; h++) {
    const dw = Math.min(Math.abs(h - warmH), 180 - Math.abs(h - warmH));
    const dc = Math.min(Math.abs(h - coolH), 180 - Math.abs(h - coolH));
    const dp = Math.min(Math.abs(h - pinkH), 180 - Math.abs(h - pinkH));
    const dg = Math.min(Math.abs(h - greenSourceH), 180 - Math.abs(h - greenSourceH));

    let wWarm = Math.exp(-(dw * dw) / twoSigma2);
    let wCool = Math.exp(-(dc * dc) / twoSigma2);
    let wPink = Math.exp(-(dp * dp) / twoSigma2);
    let wGreen = Math.exp(-(dg * dg) / twoSigma2);

    // --- ZONA MODIFICATA ---
    // RIMOSSO il boost a gradini "if (h >= 50 && h <= 75)"
    
    // AGGIUNTO un boost graduale e configurabile per i verdi
    const boostSigma = 8.0;   // Controlla la LARGHEZZA del boost (più piccolo = più stretto)
    const maxBoost = 1.75;    // Controlla la FORZA massima del boost al centro dei verdi
    
    const distFromGreen = Math.min(Math.abs(h - greenSourceH), 180 - Math.abs(h - greenSourceH));
    const boostFactor = Math.exp(-(distFromGreen * distFromGreen) / (2 * boostSigma * boostSigma));
    wGreen *= (1 + (maxBoost - 1) * boostFactor);
    // -----------------------

    const wSum = wWarm + wCool + wPink + wGreen;

    if (wSum < 1e-6) {
      hueLut[h] = h;
      satLut[h] = 1.0;
    } else {
      wWarm /= wSum;
      wCool /= wSum;
      wPink /= wSum;
      wGreen /= wSum;

      const avgX =
        wWarm * Math.cos(warmRad) +
        wCool * Math.cos(coolRad) +
        wPink * Math.cos(pinkRad) +
        wGreen * Math.cos(purpleRad);
      const avgY =
        wWarm * Math.sin(warmRad) +
        wCool * Math.sin(coolRad) +
        wPink * Math.sin(pinkRad) +
        wGreen * Math.sin(purpleRad);

      let newHueDeg = (Math.atan2(avgY, avgX) * 180) / Math.PI;
      if (newHueDeg < 0) newHueDeg += 360;
      const newHue = Math.round(newHueDeg / 2) % 180;

      hueLut[h] = newHue;
      satLut[h] =
        wWarm * satBoostWarm +
        wCool * satBoostCool +
        wPink * satBoostPink +
        wGreen * satBoostPurple;
    }
  }

  return { hueLut, satLut };
}

const LUT_V1 = buildOrangeTealLUT();
const LUT_V2 = buildOrangeTealLUTv2();
const LUT_V3 = buildOrangeTealLUTv3();

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
    version === 3 ? LUT_V3 : version === 2 ? LUT_V2 : LUT_V1;

  const greenLowerDeg = 50;
  const greenUpperDeg = 130;
  const satMin = 60 / 255;
  const valMin = 40 / 255;
  const targetDeg = 327;
  const satBoostGreen = 1.4;

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
    let newHue, newSat;

    const hIdx = Math.floor(h / 2);
    const newHueIdx = HUE_LUT[hIdx];
    const satMult = SAT_LUT[hIdx];
    newHue = newHueIdx * 2;
    newSat = Math.min(1, s * satMult);

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

