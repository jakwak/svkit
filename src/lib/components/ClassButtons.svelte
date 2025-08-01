<script lang="ts">
  let { color = true } = $props()

  // 버튼 클릭 핸들러
  function handleButtonClick(number: number) {
    console.log(`버튼 ${number} 클릭됨`)
    // 여기에 버튼 클릭 시 로직
    if (typeof window !== 'undefined' && (window as any).sendBroadcast) {
      (window as any).sendBroadcast('show_buttons', { data: 'custom data', admin_number: number })
    }
  }
</script>

<div class="class-buttons-container">
  <div class="buttons-wrapper">
    {#each [1, 2, 3, 4] as number}
      <button
        class="number-btn {color ? 'colorful' : 'plain'}"
        onclick={() => handleButtonClick(number)}
      >
        <span class="number-text">{number}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .class-buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .buttons-wrapper {
    display: flex;
    gap: 20px;
    align-items: center;
    width: 100%;
    max-width: 1000px;
    padding: 0 20px;
  }

  .number-btn {
    flex: 1;
    height: 200px;
    min-width: 0;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  /* 평범한 버튼 스타일 */
  .number-btn.plain {
    background: transparent;
    color: #333;
    border: 3px solid #ccc;
    box-shadow: none;
  }

  .number-btn.plain:hover {
    background: transparent;
    border-color: #ff6348;
    color: #ff6348;
    box-shadow: 0 4px 12px rgba(255, 99, 72, 0.2);
  }

  .number-btn.plain:active {
    background: transparent;
  }

  /* 컬러풀한 버튼 스타일 */
  .number-btn.colorful {
    background: transparent;
    color: #4ecdc4;
    border: 3px solid #4ecdc4;
    box-shadow: none;
    animation: gentle-pulse 4s ease-in-out infinite;
  }

  .number-btn.colorful:hover {
    box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
  }

  .number-btn.colorful:active {
    transition: all 0.1s ease;
  }

  .number-btn.colorful:nth-child(1) {
    color: #ff6348;
    border-color: #ff6348;
    animation-delay: 0s;
  }

  .number-btn.colorful:nth-child(2) {
    color: #4ecdc4;
    border-color: #4ecdc4;
    animation-delay: 0.5s;
  }

  .number-btn.colorful:nth-child(3) {
    color: #667eea;
    border-color: #667eea;
    animation-delay: 1s;
  }

  .number-btn.colorful:nth-child(4) {
    color: #f5576c;
    border-color: #f5576c;
    animation-delay: 1.5s;
  }

  .number-text {
    font-size: 108px;
    font-weight: normal;
    position: relative;
    z-index: 2;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* 아웃라인 스타일에서는 반짝이는 효과와 원형 확산 효과 제거 */

  @keyframes gentle-pulse {
    0%,
    100% {
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
    }
    50% {
      box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .buttons-wrapper {
      gap: 15px;
      padding: 0 15px;
    }

    .number-btn {
      height: 160px;
      border-radius: 25px;
    }

    .number-text {
      font-size: 84px;
    }


  }

  @media (max-width: 480px) {
    .buttons-wrapper {
      gap: 10px;
      padding: 0 10px;
    }

    .number-btn {
      height: 120px;
      border-radius: 20px;
    }

    .number-text {
      font-size: 63px;
    }


  }
</style>
