import { showToast } from './toast.js';
import { applyOrangeTealFilter } from './filters/orangeTeal.js';

export function initFilters(elements, state) {
  elements.filterItems.forEach(item => {
    item.addEventListener('click', () => selectFilter(item, elements, state));
  });
  elements.closeAdjustment.addEventListener('click', () => closeAdjustmentPanel(elements, state));
  elements.cancelAdjustment.addEventListener('click', () => cancelFilterAdjustment(elements, state));
  elements.applyAdjustment.addEventListener('click', () => applyFilterAdjustment(elements, state));
  elements.intensitySlider.addEventListener('input', () => updateIntensityValue(elements, state));
  elements.contrastSlider.addEventListener('input', () => updateContrastValue(elements, state));
  elements.brightnessSlider.addEventListener('input', () => updateBrightnessValue(elements, state));
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
  state.previewBaseImage = state.currentImage;
  if (state.previousSettings && state.previousSettings.filterId === state.currentFilter.id) {
    elements.intensitySlider.value = state.previousSettings.intensity;
    elements.contrastSlider.value = state.previousSettings.contrast;
    elements.brightnessSlider.value = state.previousSettings.brightness;
  } else {
    elements.intensitySlider.value = 100;
    elements.contrastSlider.value = 0;
    elements.brightnessSlider.value = 0;
  }
  updateIntensityValue(elements, state);
  updateContrastValue(elements, state);
  updateBrightnessValue(elements, state);
}

export function closeAdjustmentPanel(elements, state) {
  elements.adjustmentsSidebar.classList.remove('active');
  if (state.currentImage) {
    elements.previewImage.src = state.currentImage;
  }
  state.previewBaseImage = null;
}

function cancelFilterAdjustment(elements, state) {
  state.previousSettings = {
    filterId: state.currentFilter.id,
    intensity: parseInt(elements.intensitySlider.value, 10),
    contrast: parseInt(elements.contrastSlider.value, 10),
    brightness: parseInt(elements.brightnessSlider.value, 10)
  };
  closeAdjustmentPanel(elements, state);
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
  if (state.currentFilter.id === 'orange-teal') {
    state.currentImage = elements.previewImage.src;
  }
  state.previousSettings = null;
  closeAdjustmentPanel(elements, state);
  showToast('Filter applied successfully', 'success');
}

function updateIntensityValue(elements, state) {
  elements.intensityValue.textContent = `${elements.intensitySlider.value}%`;
  previewCurrentFilter(elements, state);
}

function updateContrastValue(elements, state) {
  elements.contrastValue.textContent = `${elements.contrastSlider.value > 0 ? '+' : ''}${elements.contrastSlider.value}%`;
  previewCurrentFilter(elements, state);
}

function updateBrightnessValue(elements, state) {
  elements.brightnessValue.textContent = `${elements.brightnessSlider.value > 0 ? '+' : ''}${elements.brightnessSlider.value}%`;
  previewCurrentFilter(elements, state);
}

function previewCurrentFilter(elements, state) {
  if (!state.previewBaseImage) return;
  if (state.currentFilter.id === 'orange-teal') {
    const img = new Image();
    img.onload = () => {
      applyOrangeTealFilter(img, {
        intensity: parseInt(elements.intensitySlider.value, 10),
        contrast: parseInt(elements.contrastSlider.value, 10),
        brightness: parseInt(elements.brightnessSlider.value, 10)
      });
      elements.previewImage.src = img.src;
    };
    img.src = state.previewBaseImage;
  }
}
