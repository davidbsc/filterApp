import { elements } from './elements.js';

export function showConfirm(message, onConfirm) {
  elements.confirmMessage.textContent = message;
  elements.confirmModal.classList.add('show');

  function handleAccept() {
    cleanup();
    onConfirm();
  }

  function handleCancel() {
    cleanup();
  }

  function cleanup() {
    elements.confirmAccept.removeEventListener('click', handleAccept);
    elements.confirmCancel.removeEventListener('click', handleCancel);
    elements.confirmModal.classList.remove('show');
  }

  elements.confirmAccept.addEventListener('click', handleAccept);
  elements.confirmCancel.addEventListener('click', handleCancel);
}
