import { showToast } from './toast.js';
import { applyOrangeTealFilter } from './filters/orangeTeal.js';
import { applyBlackWhiteFilter } from './filters/blackWhite.js';
import { applyBrightnessContrast } from './adjustments.js';

export function initFilters(elements, state) {
  elements.filterItems.forEach(item => {
    item.addEventListener('click', () => selectFilter(item, elements, state));
  });
  elements.closeAdjustment.addEventListener('click', () => {
    elements.previewImage.src = state.currentImage;
    state.previewBaseImage = null;
    closeAdjustmentPanel(elements);
  });
  elements.cancelAdjustment.addEventListener('click', () => cancelFilterAdjustment(elements, state));
  elements.applyAdjustment.addEventListener('click', () => applyFilterAdjustment(elements, state));
  elements.intensitySlider.addEventListener('input', () => {
    updateIntensityValue(elements);
    // previewCurrentFilter(elements, state); // Real-time preview (disabled for performance)
  });
  elements.intensitySlider.addEventListener('change', () => {
    updateIntensityValue(elements);
    previewCurrentFilter(elements, state);
  });
  elements.contrastSlider.addEventListener('input', () => {
    updateContrastValue(elements);
    // previewCurrentFilter(elements, state); // Real-time preview (disabled for performance)
  });
  elements.contrastSlider.addEventListener('change', () => {
    updateContrastValue(elements);
    previewCurrentFilter(elements, state);
  });
  elements.brightnessSlider.addEventListener('input', () => {
    updateBrightnessValue(elements);
    // previewCurrentFilter(elements, state); // Real-time preview (disabled for performance)
  });
  elements.brightnessSlider.addEventListener('change', () => {
    updateBrightnessValue(elements);
    previewCurrentFilter(elements, state);
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

  state.previewBaseImage = new Image();
  state.previewBaseImage.src = state.currentImage;
  state.previewBaseImage.onload = () => previewCurrentFilter(elements, state);
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
  elements.previewImage.src = state.previewBaseImage.src;
  state.previewBaseImage = null;
  closeAdjustmentPanel(elements);
  showToast('Changes remembered', 'success');
}

function applyFilterAdjustment(elements, state) {
  state.filterSettings = {
    intensity: parseInt(elements.intensitySlider.value, 10),
    contrast: parseInt(elements.contrastSlider.value, 10),
    brightness: parseInt(elements.brightnessSlider.value, 10)
  };
  const existingFilterIndex = state.appliedFilters.findIndex(f => f.id === state.currentFilter.id);
  if (existingFilterIndex !== -1) {
    state.appliedFilters[existingFilterIndex] = { ...state.currentFilter, settings: { ...state.filterSettings } };
  } else {
    state.appliedFilters.push({ ...state.currentFilter, settings: { ...state.filterSettings } });
  }
  state.imageHistory.push(state.currentImage);
  if (state.currentFilter.id === 'orange-teal') {
    elements.previewImage.onload = () => {
      elements.previewImage.onload = null;
      const result = applyBrightnessContrast(
        elements.previewImage,
        elements.previewImage,
        state.filterSettings.brightness,
        state.filterSettings.contrast
      );
      state.currentImage = result;
      state.previewBaseImage = null;
      state.previousSettings = null;
      closeAdjustmentPanel(elements);
      showToast('Filter applied successfully', 'success');
    };
    applyOrangeTealFilter(state.previewBaseImage, elements.previewImage, {
      intensity: state.filterSettings.intensity
    });
  } else if (state.currentFilter.id === 'black-white') {
    elements.previewImage.onload = () => {
      elements.previewImage.onload = null;
      const result = applyBrightnessContrast(
        elements.previewImage,
        elements.previewImage,
        state.filterSettings.brightness,
        state.filterSettings.contrast
      );
      state.currentImage = result;
      state.previewBaseImage = null;
      state.previousSettings = null;
      closeAdjustmentPanel(elements);
      showToast('Filter applied successfully', 'success');
    };
    applyBlackWhiteFilter(state.previewBaseImage, elements.previewImage, {
      intensity: state.filterSettings.intensity
    });
  } else {
    state.previousSettings = null;
    closeAdjustmentPanel(elements);
    showToast('Filter applied successfully', 'success');
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

function previewCurrentFilter(elements, state) {
  if (!state.previewBaseImage || !state.currentFilter) return;
  if (state.currentFilter.id === 'orange-teal') {
    const options = {
      intensity: parseInt(elements.intensitySlider.value, 10)
    };
    elements.previewImage.onload = () => {
      elements.previewImage.onload = null;
      applyBrightnessContrast(
        elements.previewImage,
        elements.previewImage,
        parseInt(elements.brightnessSlider.value, 10),
        parseInt(elements.contrastSlider.value, 10)
      );
    };
    applyOrangeTealFilter(state.previewBaseImage, elements.previewImage, options);
  } else if (state.currentFilter.id === 'black-white') {
    const options = {
      intensity: parseInt(elements.intensitySlider.value, 10)
    };
    elements.previewImage.onload = () => {
      elements.previewImage.onload = null;
      applyBrightnessContrast(
        elements.previewImage,
        elements.previewImage,
        parseInt(elements.brightnessSlider.value, 10),
        parseInt(elements.contrastSlider.value, 10)
      );
    };
    applyBlackWhiteFilter(state.previewBaseImage, elements.previewImage, options);
  }
}
