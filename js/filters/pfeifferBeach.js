export function applyPfeifferBeachFilter(sourceImg, targetEl, options = {}) {
  /**
   * Pfeiffer Beach filter
   *
   * This effect produces a soft pastel look with a gentle purple tint,
   * reminiscent of retro film stocks like those found in Retrica.  It
   * lifts the shadows, slightly reduces saturation and overlays a
   * magenta/blue wash across the frame.  The `intensity` option
   * controls the strength of the effect; at zero the image is
   * unchanged while at 100 the full vintage pastel palette is used.
   */
  const { intensity = 100 } = options;
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

  // Helper conversions between RGB and HSV
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

  // Parameter values controlling the look of the filter.  Tuned by eye
  // using the supplied reference picture.
  // The following tuning values were chosen to produce a soft
  // pastel‑purple wash without overwhelming the underlying image.
  // They boost the red and blue channels more than green to hint at
  // the lavender tones visible in the sample, while also gently
  // lifting brightness and slightly lowering saturation.  Feel free
  // to tweak these multipliers if you'd like a stronger or milder
  // effect.
  const satFactor = 1 - 0.15 * blend;      // reduce saturation up to 15%
  const brightFactor = 1 + 0.10 * blend;   // increase brightness up to 10%
  const rMul = 1 + 0.12 * blend;           // red boost
  const gMul = 1 + 0.05 * blend;           // green boost
  const bMul = 1 + 0.15 * blend;           // blue boost
  const constantShift = {
    r: 20 * blend,
    g: 10 * blend,
    b: 25 * blend
  };

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    // Convert to HSV for separate manipulation of saturation and value
    let [h, s, v] = rgbToHsv(r, g, b);
    s = Math.min(1, s * satFactor);
    v = Math.min(1, v * brightFactor);
    [r, g, b] = hsvToRgb(h, s, v);
    // Apply channel multipliers for the purple tint
    r *= rMul;
    g *= gMul;
    b *= bMul;
    // Add constant colour shift
    r += constantShift.r;
    g += constantShift.g;
    b += constantShift.b;
    // Interpolate with the original pixel
    const rNew = Math.max(0, Math.min(255, data[i] * (1 - blend) + r * blend));
    const gNew = Math.max(0, Math.min(255, data[i + 1] * (1 - blend) + g * blend));
    const bNew = Math.max(0, Math.min(255, data[i + 2] * (1 - blend) + b * blend));
    data[i] = rNew;
    data[i + 1] = gNew;
    data[i + 2] = bNew;
    // Alpha channel is preserved
  }
  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}
