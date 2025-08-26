export function showConfirmDialog(message, onConfirm) {
  const overlay = document.getElementById('confirmOverlay');
  const msgEl = document.getElementById('confirmMessage');
  const okBtn = document.getElementById('confirmOk');
  const cancelBtn = document.getElementById('confirmCancel');

  msgEl.textContent = message;
  overlay.classList.add('active');

  function cleanup() {
    overlay.classList.remove('active');
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
  }

  function handleOk() {
    cleanup();
    if (typeof onConfirm === 'function') onConfirm();
  }

  function handleCancel() {
    cleanup();
  }

  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
}
