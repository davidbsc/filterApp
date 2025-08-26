import { showToast } from './toast.js';

export function initDragAndDrop(elements, state) {
  elements.dropArea.addEventListener('click', () => elements.fileInput.click());
  elements.dropArea.addEventListener('dragover', handleDragOver);
  elements.dropArea.addEventListener('dragleave', handleDragLeave);
  elements.dropArea.addEventListener('drop', handleDrop);
  elements.fileInput.addEventListener('change', handleFileSelect);

  function handleDragOver(e) {
    e.preventDefault();
    elements.dropArea.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    elements.dropArea.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    elements.dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        loadImage(file);
      } else {
        showToast('Please upload an image file', 'error');
      }
    }
  }

  function handleFileSelect(e) {
    if (e.target.files.length) {
      const file = e.target.files[0];
      loadImage(file);
    }
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      state.currentImage = e.target.result;
      state.originalImage = e.target.result;
      state.appliedFilters = [];
      state.history = [];
      elements.previewImage.src = state.currentImage;
      elements.previewImage.style.display = 'block';
      elements.dropArea.style.display = 'none';
      showToast('Image loaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  }
}
