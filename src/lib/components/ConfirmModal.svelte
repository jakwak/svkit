<script lang="ts">
  interface ConfirmModalProps {
    show: boolean
    title: string
    message: string
    subtitle?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
  }

  let { 
    show, 
    title, 
    message, 
    subtitle = '', 
    confirmText = '확인', 
    cancelText = '취소',
    onConfirm,
    onCancel 
  }: ConfirmModalProps = $props()
</script>

<div class="modal-overlay" class:show={show}>
  <div class="modal-content confirm-modal" class:show={show}>
    <div class="confirm-modal-header">
      <h3 class="confirm-title">{title}</h3>
    </div>
    <div class="confirm-modal-body">
      <p class="confirm-message">{@html message}</p>
      {#if subtitle}
        <p class="confirm-subtitle">{@html subtitle}</p>
      {/if}
    </div>
    <div class="confirm-modal-actions">
      <button 
        class="confirm-btn cancel-btn"
        onclick={onCancel}
      >
        {cancelText}
      </button>
      <button 
        class="confirm-btn confirm-btn-primary"
        onclick={onConfirm}
      >
        {confirmText}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .modal-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-content {
    background-color: rgba(31, 41, 55, 0.8);
    padding: 2rem;
    border-radius: 10px;
    transform: scale(0.5);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .modal-content.show {
    transform: scale(1);
    opacity: 1;
  }

  .confirm-modal {
    max-width: 400px;
    width: 90%;
    text-align: center;
    margin: 2rem;
  }

  .confirm-modal-header {
    margin-bottom: 1.5rem;
  }

  .confirm-title {
    font-size: 1.5rem;
    font-weight: normal;
    color: #f3f4f6;
    margin: 0;
  }

  .confirm-modal-body {
    margin-bottom: 2rem;
  }

  .confirm-message {
    font-size: 1.1rem;
    color: #d1d5db;
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  .confirm-subtitle {
    font-size: 1rem;
    color: #9ca3af;
    margin: 0;
  }

  .confirm-modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .confirm-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background-color: #6b7280;
    color: white;
  }

  .cancel-btn:hover {
    background-color: #4b5563;
  }

  .confirm-btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .confirm-btn-primary:hover {
    background-color: #2563eb;
  }
</style> 