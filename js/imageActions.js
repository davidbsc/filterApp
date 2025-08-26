import { showToast } from './toast.js';
import { closeAdjustmentPanel } from './filters.js';

export function initImageActions(elements, state) {
  elements.downloadBtn.addEventListener('click', () => downloadImage(state));
  elements.resetBtn.addEventListener('click', () => resetImage(elements, state));
  elements.newProjectBtn.addEventListener('click', () => newProject(elements, state));
}

function downloadImage(state) {
  if (!state.currentImage) {
    showToast('No image to download', 'warning');
    return;
  }
  showToast('Image downloaded successfully', 'success');
}

function resetImage(elements, state) {
  if (!state.currentImage) {
    showToast('No image to reset', 'warning');
    return;
  }
  state.appliedFilters = [];
  elements.filterItems.forEach(item => item.classList.remove('active'));
  state.currentFilter = null;
  closeAdjustmentPanel(elements, state);
  showToast('Image reset successfully', 'success');
}

function newProject(elements, state) {
  state.currentImage = null;
  state.currentFilter = null;
  state.appliedFilters = [];
  state.previousSettings = null;

  elements.previewImage.style.display = 'none';
  elements.dropArea.style.display = 'flex';
  elements.filterItems.forEach(item => item.classList.remove('active'));
  closeAdjustmentPanel(elements, state);
  showToast('New project created', 'success');
}
