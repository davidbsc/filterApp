export function applyCaliforniaFilter(sourceImg, targetEl, options = {}) {
  /**
   * California filter
   *
   * This effect is inspired by the "Bazar" preset found in popular
   * photo‑editing applications.  The goal is to make colours pop by
   * gently increasing brightness and saturation while warming up the
   * overall tone.  A slight contrast boost is also applied so the
   * darkest and brightest portions of the picture feel more defined.
   *
   * The `intensity` option controls how strongly the filter is applied.
   * At 0 the image will remain unchanged.  At 100 the full effect is
   * used.  Intermediate values linearly interpolate between the
   * unmodified pixel and its transformed counterpart.
   */

  const { intensity = 100 } = options;
  // Early exit if intensity is zero
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

  // Pre‑compute some factors.  These numbers were chosen based on
  // empirical experimentation against the provided reference image.
  const satBoost = 0.25 * blend;     // increase saturation by up to 25%
  const brightBoost = 0.15 * blend;  // increase value (brightness) by up to 15%
  const contrastBoost = 0.15 * blend;// increase contrast by up to 15%
  const redShift = 15 * blend;       // warm up the highlights
  const greenShift = 5 * blend;
  const blueShift = 0;

  // Helper functions to convert between RGB and HSV.  These are
  // duplicated here to avoid pulling in external dependencies.
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

  // Iterate through each pixel and apply the transformation
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Convert to HSV to adjust saturation and brightness independently
    let [h, s, v] = rgbToHsv(r, g, b);
    // Boost saturation and brightness.  Clamp saturation at 1 to avoid
    // oversaturation.
    s = Math.min(1, s * (1 + satBoost));
    v = Math.min(1, v * (1 + brightBoost));
    [r, g, b] = hsvToRgb(h, s, v);

    // Apply a small warm colour shift
    r = r + redShift;
    g = g + greenShift;
    b = b + blueShift;

    // Contrast adjustment around the midpoint (128)
    r = (r - 128) * (1 + contrastBoost) + 128;
    g = (g - 128) * (1 + contrastBoost) + 128;
    b = (b - 128) * (1 + contrastBoost) + 128;

    // Linearly interpolate between original pixel and fully adjusted
    // pixel based on intensity blend.  This prevents abrupt jumps if
    // users lower the intensity slider in the UI.
    data[i] = Math.max(0, Math.min(255, data[i] * (1 - blend) + r * blend));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * (1 - blend) + g * blend));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * (1 - blend) + b * blend));
    // Preserve alpha channel
  }

  ctx.putImageData(imageData, 0, 0);
  targetEl.src = canvas.toDataURL();
}
