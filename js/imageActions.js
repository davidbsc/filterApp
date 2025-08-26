import { showToast } from './toast.js';
import { closeAdjustmentPanel } from './filters.js';
import { showConfirm } from './confirmDialog.js';

export function initImageActions(elements, state) {
  elements.downloadBtn.addEventListener('click', () => downloadImage(state));
  elements.resetBtn.addEventListener('click', () => {
    if (!state.currentImage) {
      showToast('No image to reset', 'warning');
      return;
    }
    showConfirm('Reset image to original?', () => resetImage(elements, state));
  });
  elements.newProjectBtn.addEventListener('click', () => {
    showConfirm('Load a new image? Current changes will be lost.', () => newProject(elements, state));
  });
  elements.undoBtn.addEventListener('click', () => undoLastFilter(elements, state));
}

function downloadImage(state) {
  if (!state.currentImage) {
    showToast('No image to download', 'warning');
    return;
  }
  showToast('Image downloaded successfully', 'success');
}

function resetImage(elements, state) {
  state.appliedFilters = [];
  state.history = [];
  elements.filterItems.forEach(item => item.classList.remove('active'));
  state.currentFilter = null;
  state.previewBaseImage = null;
  state.previousSettings = null;
  state.currentImage = state.originalImage;
  elements.previewImage.src = state.originalImage;
  closeAdjustmentPanel(elements);
  showToast('Image reset successfully', 'success');
}

function newProject(elements, state) {
  state.currentImage = null;
  state.originalImage = null;
  state.currentFilter = null;
  state.appliedFilters = [];
  state.previousSettings = null;
  state.previewBaseImage = null;
  state.history = [];

  elements.previewImage.style.display = 'none';
  elements.dropArea.style.display = 'flex';
  elements.filterItems.forEach(item => item.classList.remove('active'));
  closeAdjustmentPanel(elements);
  showToast('New project created', 'success');
}

function undoLastFilter(elements, state) {
  if (state.history.length === 0) {
    showToast('Nothing to undo', 'warning');
    return;
  }
  const previous = state.history.pop();
  state.appliedFilters.pop();
  state.currentImage = previous;
  elements.previewImage.src = previous;
  elements.filterItems.forEach(item => item.classList.remove('active'));
  state.currentFilter = null;
  state.previewBaseImage = null;
  closeAdjustmentPanel(elements);
  showToast('Last action undone', 'success');
}
