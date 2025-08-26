import { showToast } from './toast.js';
import { closeAdjustmentPanel } from './filters.js';
import { showConfirmDialog } from './confirmDialog.js';

export function initImageActions(elements, state) {
  elements.downloadBtn.addEventListener('click', () => downloadImage(state));
  elements.resetBtn.addEventListener('click', () => {
    if (!state.currentImage) {
      showToast('No image to reset', 'warning');
      return;
    }
    showConfirmDialog('Reset image and remove all changes?', () => resetImage(elements, state));
  });
  elements.newProjectBtn.addEventListener('click', () => {
    if (!state.currentImage) {
      newProject(elements, state);
      return;
    }
    showConfirmDialog('Load a new image? Current changes will be lost.', () => newProject(elements, state));
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
  state.currentImage = state.originalImage;
  elements.previewImage.src = state.originalImage;
  state.appliedFilters = [];
  state.imageHistory = [];
  elements.filterItems.forEach(item => item.classList.remove('active'));
  state.currentFilter = null;
  state.previewBaseImage = null;
  closeAdjustmentPanel(elements);
  showToast('Image reset successfully', 'success');
}

function newProject(elements, state) {
  state.originalImage = null;
  state.currentImage = null;
  state.currentFilter = null;
  state.appliedFilters = [];
  state.imageHistory = [];
  state.previousSettings = null;
  state.previewBaseImage = null;

  elements.previewImage.style.display = 'none';
  elements.dropArea.style.display = 'flex';
  elements.filterItems.forEach(item => item.classList.remove('active'));
  closeAdjustmentPanel(elements);
  showToast('New project created', 'success');
}

function undoLastFilter(elements, state) {
  if (!state.currentImage || state.imageHistory.length === 0) {
    showToast('No actions to undo', 'warning');
    return;
  }
  const previousImage = state.imageHistory.pop();
  state.appliedFilters.pop();
  state.currentImage = previousImage;
  elements.previewImage.src = previousImage;
  elements.filterItems.forEach(item => item.classList.remove('active'));
  state.currentFilter = null;
  showToast('Last filter removed', 'success');
}
