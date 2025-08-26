import { elements } from './elements.js';
import { state } from './state.js';
import { initDragAndDrop } from './dragDrop.js';
import { initFilters } from './filters.js';
import { initImageActions } from './imageActions.js';

document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop(elements, state);
  initFilters(elements, state);
  initImageActions(elements, state);
});
