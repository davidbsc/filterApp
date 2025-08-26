import { showToast } from './toast.js';
import { applyOrangeTealFilter } from './filters/orangeTeal.js';

export function initFilters(elements, state) {
  elements.filterItems.forEach(item => {
    item.addEventListener('click', () => selectFilter(item, elements, state));
  });
  elements.closeAdjustment.addEventListener('click', () => closeAdjustmentPanel(elements));
  elements.cancelAdjustment.addEventListener('click', () => cancelFilterAdjustment(elements, state));
  elements.applyAdjustment.addEventListener('click', () => applyFilterAdjustment(elements, state));
  elements.intensitySlider.addEventListener('input', () => {
    updateIntensityValue(elements);
    if (state.currentFilter && state.currentFilter.id !== 'orange-teal') {
      previewFilter(elements, state);
    }
  });
  elements.contrastSlider.addEventListener('input', () => {
    updateContrastValue(elements);
    previewFilter(elements, state);
  });
  elements.brightnessSlider.addEventListener('input', () => {
    updateBrightnessValue(elements);
    previewFilter(elements, state);
  });
}

function selectFilter(filterItem, elements, state) {
  if (!state.currentImage) {
    showToast('Please upload an image first', 'warning');
    return;
  }
  elements.filterItems.forEach(item => item.classList.remove('active'));
  filterItem.classList.add('active');
  const filterName = filterItem.querySelector('.filter-name').textContent;
  const filterId = filterItem.dataset.filter;
  state.currentFilter = { id: filterId, name: filterName };
  openAdjustmentPanel(filterName, elements, state);
}

function openAdjustmentPanel(filterName, elements, state) {
  elements.adjustmentTitle.textContent = `${filterName} Adjustment`;
  elements.adjustmentsSidebar.classList.add('active');
  if (state.currentFilter.id === 'orange-teal') {
    elements.intensityControl.style.display = 'none';
  } else {
    elements.intensityControl.style.display = '';
  }
  if (state.previousSettings && state.previousSettings.filterId === state.currentFilter.id) {
    elements.intensitySlider.value = state.previousSettings.intensity;
    elements.contrastSlider.value = state.previousSettings.contrast;
    elements.brightnessSlider.value = state.previousSettings.brightness;
  } else {
    elements.intensitySlider.value = 100;
    elements.contrastSlider.value = 0;
    elements.brightnessSlider.value = 0;
  }
  updateIntensityValue(elements);
  updateContrastValue(elements);
  updateBrightnessValue(elements);
  previewFilter(elements, state);
}

export function closeAdjustmentPanel(elements) {
  elements.adjustmentsSidebar.classList.remove('active');
}

function cancelFilterAdjustment(elements, state) {
  state.previousSettings = {
    filterId: state.currentFilter.id,
    intensity: elements.intensitySlider.value,
    contrast: elements.contrastSlider.value,
    brightness: elements.brightnessSlider.value
  };
  elements.previewImage.src = state.currentImage;
  closeAdjustmentPanel(elements);
  showToast('Changes remembered', 'success');
}

function applyFilterAdjustment(elements, state) {
  state.filterSettings = {
    intensity: elements.intensitySlider.value,
    contrast: elements.contrastSlider.value,
    brightness: elements.brightnessSlider.value
  };
  const existingFilterIndex = state.appliedFilters.findIndex(f => f.id === state.currentFilter.id);
  if (existingFilterIndex !== -1) {
    state.appliedFilters[existingFilterIndex] = { ...state.currentFilter, settings: { ...state.filterSettings } };
  } else {
    state.appliedFilters.push({ ...state.currentFilter, settings: { ...state.filterSettings } });
  }
  if (state.currentFilter.id === 'orange-teal') {
    const img = new Image();
    img.src = state.currentImage;
    img.onload = () => {
      applyOrangeTealFilter(img, {
        brightness: Number(state.filterSettings.brightness),
        contrast: Number(state.filterSettings.contrast)
      });
      elements.previewImage.src = img.src;
      state.currentImage = img.src;
      finalize();
    };
  } else {
    finalize();
  }

  function finalize() {
    state.previousSettings = null;
    closeAdjustmentPanel(elements);
    showToast('Filter applied successfully', 'success');
  }
}

function previewFilter(elements, state) {
  if (!state.currentFilter) return;
  const baseSrc = state.currentImage;
  const brightness = Number(elements.brightnessSlider.value);
  const contrast = Number(elements.contrastSlider.value);
  if (state.currentFilter.id === 'orange-teal') {
    const img = new Image();
    img.src = baseSrc;
    img.onload = () => {
      applyOrangeTealFilter(img, { brightness, contrast });
      elements.previewImage.src = img.src;
    };
  } else {
    elements.previewImage.src = baseSrc;
  }
}

function updateIntensityValue(elements) {
  elements.intensityValue.textContent = `${elements.intensitySlider.value}%`;
}

function updateContrastValue(elements) {
  elements.contrastValue.textContent = `${elements.contrastSlider.value > 0 ? '+' : ''}${elements.contrastSlider.value}%`;
}

function updateBrightnessValue(elements) {
  elements.brightnessValue.textContent = `${elements.brightnessSlider.value > 0 ? '+' : ''}${elements.brightnessSlider.value}%`;
}
