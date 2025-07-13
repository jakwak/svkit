<script lang="ts">
  const { onNumberClick } = $props<{
    onNumberClick: (number: number) => void
  }>()
</script>

<div class="buttons-container">
  <div class="number-buttons">
    <button class="number-button btn-1" onclick={() => onNumberClick(1)}>1</button>
    <button class="number-button btn-2" onclick={() => onNumberClick(2)}>2</button>
    <button class="number-button btn-3" onclick={() => onNumberClick(3)}>3</button>
    <button class="number-button btn-4" onclick={() => onNumberClick(4)}>4</button>
  </div>
</div>

<style>
  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 0;
    padding-top: 50px;
  }

  .number-buttons {
    display: flex;
    gap: 30px;
    align-items: center;
    width: 100%;
    justify-content: center;
  }

  .number-button {
    width: 200px;
    height: 200px;
    border: none;
    border-radius: 25px;
    font-size: 120px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    color: white;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
  }

  .btn-1 {
    background: linear-gradient(135deg, #fff2cc, #ffd966);
  }

  .btn-2 {
    background: linear-gradient(135deg, #b3d9ff, #8ac4ff);
  }

  .btn-3 {
    background: linear-gradient(135deg, #b3ffb3, #8aff8a);
  }

  .btn-4 {
    background: linear-gradient(135deg, #ffb3ff, #ff8aff);
  }

  .number-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    .number-buttons {
      gap: 15px;
    }

    .number-button {
      width: 120px;
      height: 120px;
      font-size: 72px;
    }
  }
</style> 