import { applyOrangeTealFilter } from './orangeTeal.js';

export function applyOrangePinkFilter(sourceImg, targetEl, options = {}) {
  const { intensity = 100 } = options;
  applyOrangeTealFilter(sourceImg, targetEl, { intensity, version: 4 });
}

