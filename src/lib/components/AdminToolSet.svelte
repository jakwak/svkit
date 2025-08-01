<script lang="ts">
  const {
    isVerticalAlignment = false,
    onHorizontalAlign = () => {},
    onVerticalAlign = () => {},
  } = $props<{
    isVerticalAlignment?: boolean
    onHorizontalAlign?: () => void
    onVerticalAlign?: () => void
  }>()
</script>

<div class="alignment-controls">
  <button
    class="alignment-button"
    class:active={!isVerticalAlignment}
    onclick={onHorizontalAlign}
    title="가로 정렬"
    aria-label="가로 정렬"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 8h12M6 4l-4 4 4 4M10 4l4 4-4 4" />
    </svg>
  </button>
  <button
    class="alignment-button"
    class:active={isVerticalAlignment}
    onclick={onVerticalAlign}
    title="세로 정렬"
    aria-label="세로 정렬"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" />
    </svg>
  </button>
</div>

<style>
  .alignment-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 1000;
  }

  .alignment-button {
    width: 32px;
    height: 32px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0;
  }

  .alignment-button svg {
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .alignment-button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .alignment-button:active {
  }

  .alignment-button.active {
    color: #ffffff;
  }

  .alignment-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #ffffff;
    border-radius: 1px;
  }
</style> 