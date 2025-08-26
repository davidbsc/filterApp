import { elements } from './elements.js';

export function showToast(message, type = 'success') {
  elements.toastMessage.textContent = message;
  elements.toast.classList.remove('success', 'error', 'warning');
  elements.toast.classList.add(type);
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}
