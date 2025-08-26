import { showToast } from './toast.js';

export function initFilters(elements, state) {
  elements.filterItems.forEach(item => {
    item.addEventListener('click', () => selectFilter(item, elements, state));
  });
  elements.closeAdjustment.addEventListener('click', () => closeAdjustmentPanel(elements));
  elements.cancelAdjustment.addEventListener('click', () => cancelFilterAdjustment(elements, state));
  elements.applyAdjustment.addEventListener('click', () => applyFilterAdjustment(elements, state));
  elements.intensitySlider.addEventListener('input', () => updateIntensityValue(elements));
  elements.contrastSlider.addEventListener('input', () => updateContrastValue(elements));
  elements.brightnessSlider.addEventListener('input', () => updateBrightnessValue(elements));
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
  state.previousSettings = null;
  closeAdjustmentPanel(elements);
  showToast('Filter applied successfully', 'success');
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
