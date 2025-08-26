import { showToast } from './toast.js';
import { applyOrangeTealFilter } from './filters/orangeTeal.js';
import { applyBlackWhiteFilter } from './filters/blackWhite.js';
import { applyVintageFilter } from './filters/vintage.js';
import { applyBrightnessContrast } from './adjustments.js';

const sliderConfigs = {
  vintage: [
    { name: 'alpha', label: 'Alpha', min: -100, max: 100, default: 0 },
    { name: 'beta', label: 'Beta', min: -50, max: 50, default: 0 },
    { name: 'gamma', label: 'Gamma', min: -50, max: 50, default: 0 },
    { name: 'delta', label: 'Delta', min: -50, max: 50, default: 0 }
  ]
};

function enableValueEdit(slider, valueSpan, onChange, elements, state) {
  valueSpan.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = slider.min;
    input.max = slider.max;
    input.value = slider.value;
    valueSpan.textContent = '';
    valueSpan.appendChild(input);
    input.focus();
    input.select();
    const commit = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val)) val = parseInt(slider.value, 10);
      val = Math.max(parseInt(slider.min, 10), Math.min(parseInt(slider.max, 10), val));
      slider.value = val;
      onChange();
      previewCurrentFilter(elements, state);
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });

  slider.addEventListener('contextmenu', e => {
    e.preventDefault();
    slider.value = slider.defaultValue;
    onChange();
    previewCurrentFilter(elements, state);
  });
}

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

  enableValueEdit(
    elements.intensitySlider,
    elements.intensityValue,
    () => updateIntensityValue(elements),
    elements,
    state
  );
  enableValueEdit(
    elements.contrastSlider,
    elements.contrastValue,
    () => updateContrastValue(elements),
    elements,
    state
  );
  enableValueEdit(
    elements.brightnessSlider,
    elements.brightnessValue,
    () => updateBrightnessValue(elements),
    elements,
    state
  );
}

function setupCustomSliders(filterId, elements, state) {
  elements.customSliders.innerHTML = '';
  const configs = sliderConfigs[filterId];
  if (!configs) return;
  configs.forEach(cfg => {
    const wrapper = document.createElement('div');
    wrapper.className = 'intensity-control';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'control-label';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = cfg.label;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'slider-value';
    valueSpan.id = `${cfg.name}Value`;
    labelDiv.appendChild(nameSpan);
    labelDiv.appendChild(valueSpan);

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = cfg.min;
    input.max = cfg.max;
    input.value = state.customSettings[cfg.name] ?? cfg.default;
    input.defaultValue = cfg.default;
    input.className = 'slider';
    input.id = `${cfg.name}Slider`;
    sliderContainer.appendChild(input);

    wrapper.appendChild(labelDiv);
    wrapper.appendChild(sliderContainer);
    elements.customSliders.appendChild(wrapper);

    const format = val => (val > 0 ? `+${val}` : `${val}`);
    const update = () => {
      const val = parseInt(input.value, 10);
      state.customSettings[cfg.name] = val;
      valueSpan.textContent = format(val);
    };
    update();
    input.addEventListener('input', update);
    input.addEventListener('change', () => {
      update();
      previewCurrentFilter(elements, state);
    });
    enableValueEdit(input, valueSpan, update, elements, state);
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
  elements.downloadBtn.style.display = 'none';
  if (state.previousSettings && state.previousSettings.filterId === state.currentFilter.id) {
    elements.intensitySlider.value = state.previousSettings.intensity;
    elements.contrastSlider.value = state.previousSettings.contrast;
    elements.brightnessSlider.value = state.previousSettings.brightness;
    state.customSettings = { ...state.previousSettings.customSettings };
  } else {
    elements.intensitySlider.value = 100;
    elements.contrastSlider.value = 0;
    elements.brightnessSlider.value = 0;
    state.customSettings = {};
  }
  updateIntensityValue(elements);
  updateContrastValue(elements);
  updateBrightnessValue(elements);
  setupCustomSliders(state.currentFilter.id, elements, state);

  state.previewBaseImage = new Image();
  state.previewBaseImage.src = state.currentImage;
  state.previewBaseImage.onload = () => previewCurrentFilter(elements, state);
}

export function closeAdjustmentPanel(elements) {
  elements.adjustmentsSidebar.classList.remove('active');
  elements.downloadBtn.style.display = 'flex';
  elements.customSliders.innerHTML = '';
}

function cancelFilterAdjustment(elements, state) {
  state.previousSettings = {
    filterId: state.currentFilter.id,
    intensity: elements.intensitySlider.value,
    contrast: elements.contrastSlider.value,
    brightness: elements.brightnessSlider.value,
    customSettings: { ...state.customSettings }
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
    brightness: parseInt(elements.brightnessSlider.value, 10),
    ...state.customSettings
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
  } else if (state.currentFilter.id === 'vintage') {
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
    applyVintageFilter(state.previewBaseImage, elements.previewImage, {
      intensity: state.filterSettings.intensity,
      alpha: state.filterSettings.alpha || 0,
      beta: state.filterSettings.beta || 0,
      gamma: state.filterSettings.gamma || 0,
      delta: state.filterSettings.delta || 0
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
  } else if (state.currentFilter.id === 'vintage') {
    const options = {
      intensity: parseInt(elements.intensitySlider.value, 10),
      alpha: state.customSettings.alpha || 0,
      beta: state.customSettings.beta || 0,
      gamma: state.customSettings.gamma || 0,
      delta: state.customSettings.delta || 0
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
    applyVintageFilter(state.previewBaseImage, elements.previewImage, options);
  }
}
