<script lang="ts">
  let { color = true } = $props()

  // 버튼 클릭 핸들러
  function handleButtonClick(number: number) {
    console.log(`버튼 ${number} 클릭됨`)
    // 여기에 버튼 클릭 시 로직 추가
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
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .number-btn.plain:hover {
    background: linear-gradient(135deg, #ff9f43, #ff6348);
    border-color: #ff6348;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 159, 67, 0.3);
  }

  .number-btn.plain:active {
    background: #d0d0d0;
    transform: translateY(0);
  }

  /* 컬러풀한 버튼 스타일 */
  .number-btn.colorful {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
    box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
    animation: gentle-pulse 4s ease-in-out infinite;
  }

  .number-btn.colorful:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }

  .number-btn.colorful:active {
    transform: translateY(-6px) scale(1.02);
    transition: all 0.1s ease;
  }

  .number-btn.colorful:nth-child(1) {
    background: linear-gradient(135deg, #ff9f43, #ff6348);
    box-shadow: 0 8px 25px rgba(255, 159, 67, 0.3);
    animation-delay: 0s;
  }

  .number-btn.colorful:nth-child(2) {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
    animation-delay: 0.5s;
  }

  .number-btn.colorful:nth-child(3) {
    background: linear-gradient(135deg, #667eea, #764ba2);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    animation-delay: 1s;
  }

  .number-btn.colorful:nth-child(4) {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
    animation-delay: 1.5s;
  }



  .number-text {
    font-size: 108px;
    font-weight: bold;
    position: relative;
    z-index: 2;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* 컬러풀한 버튼 반짝이는 효과 */
  .number-btn.colorful::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .number-btn.colorful:hover::before {
    left: 100%;
  }

  /* 컬러풀한 버튼 원형 확산 효과 */
  .number-btn.colorful::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.6s ease;
  }

  .number-btn.colorful:hover::after {
    width: 200px;
    height: 200px;
  }

  @keyframes gentle-pulse {
    0%, 100% {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    50% {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
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

    .number-btn.colorful:hover::after {
      width: 180px;
      height: 180px;
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

    .number-btn.colorful:hover::after {
      width: 140px;
      height: 140px;
    }
  }
</style>
