<script lang="ts">
  import { onMount } from 'svelte'
  const { onNumberClick } = $props<{
    onNumberClick: (number: number) => void
  }>()

  let selected: number | null = null

  function handleClick(num: number) {
    selected = num
    onNumberClick(num)
  }
</script>

<div class="buttons-container">
  <div class="number-buttons">
    {#each [1,2,3,4] as num}
      <button
        class="number-button btn-{num}"
        onclick={() => handleClick(num)}
      >
        {num}
      </button>
    {/each}
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
    border-radius: 25px;
    font-size: 120px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: none;
    text-shadow: none;
    background: none;
  }

  .btn-1 {
    background: none;
    border: 4px solid #ffd966;
    color: #555;
  }
  .btn-1:hover {
    background: #ffd966;
    color: #333;
  }
  .btn-2 {
    background: none;
    border: 4px solid #8ac4ff;
    color: #555;
  }
  .btn-2:hover {
    background: #8ac4ff;
    color: #333;
  }
  .btn-3 {
    background: none;
    border: 4px solid #8aff8a;
    color: #555;
  }
  .btn-3:hover {
    background: #8aff8a;
    color: #333;
  }
  .btn-4 {
    background: none;
    border: 4px solid #ff8aff;
    color: #555;
  }
  .btn-4:hover {
    background: #ff8aff;
    color: #333;
  }

  .number-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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