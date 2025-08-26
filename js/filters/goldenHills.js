export function applyGoldenHillsFilter(sourceImg, targetEl, options = {}) {
  /**
   * Golden Hills filter
   *
   * A soft retro preset inspired by classic film photography.  It
   * reduces saturation, gently lifts the midtones and adds a warm
   * golden haze that becomes stronger towards the edges of the frame.
   * The result is a pastel‑toned picture with hints of blue and
   * magenta in the highlights, similar to the supplied Golden Hills
   * example.  The intensity parameter (0–100) controls how much of
   * this effect is mixed into the original image.
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

  // Configuration values tuned by eye to match the sample.  Feel free
  // to adjust these if you wish to refine the look further.
  // Tuneable factors controlling the hue and exposure of the Golden Hills
  // effect.  These values were chosen after experimentation to yield
  // a subtle, warm pastel look without washing out the scene.  Feel
  // free to adjust them further to better suit your tastes or source
  // material.
  const satFactor = 1 - 0.15 * blend;      // reduce saturation up to 15%
  const brightFactor = 1 + 0.10 * blend;   // increase brightness up to 10%
  const rMul = 1 + 0.08 * blend;           // slight red lift
  const gMul = 1 + 0.03 * blend;           // very slight green lift
  const bMul = 1 + 0.04 * blend;           // modest blue lift
  const constantLight = {
    r: 20 * blend,
    g: 15 * blend,
    b: 10 * blend
  };

  // Precompute centre for radial gradient
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      // Convert to HSV and adjust saturation and value
      let [h, s, v] = rgbToHsv(r, g, b);
      s = Math.min(1, s * satFactor);
      v = Math.min(1, v * brightFactor);
      [r, g, b] = hsvToRgb(h, s, v);
      // Channel‑wise multipliers for warm pastel tint
      r *= rMul;
      g *= gMul;
      b *= bMul;
      // Add a constant haze overlay
      r += constantLight.r;
      g += constantLight.g;
      b += constantLight.b;
      // Radial haze: fade towards the edges.  We compute a value in
      // [0,1] based on distance from the centre – pixels at the very
      // corners receive the most additional haze.
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const edgeFactor = Math.pow(dist, 1.2);
      // Additional haze strength.  Lower values keep highlights from
      // clipping while still introducing a gentle vignette towards the
      // corners.
      const extra = 0.5 * blend;
      r += edgeFactor * constantLight.r * extra;
      g += edgeFactor * constantLight.g * extra;
      b += edgeFactor * constantLight.b * extra;
      // Interpolate with original to respect intensity
      const rNew = Math.max(0, Math.min(255, data[idx] * (1 - blend) + r * blend));
      const gNew = Math.max(0, Math.min(255, data[idx + 1] * (1 - blend) + g * blend));
      const bNew = Math.max(0, Math.min(255, data[idx + 2] * (1 - blend) + b * blend));
      data[idx] = rNew;
      data[idx + 1] = gNew;
      data[idx + 2] = bNew;
      // Alpha channel remains unchanged
    }
  }
  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}
