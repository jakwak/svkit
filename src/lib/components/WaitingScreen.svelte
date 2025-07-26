<script lang="ts">
  // const { onParticipationClick } = $props<{
  //   onParticipationClick: () => void
  // }>()
</script>

<div class="waiting-container">
  <div class="waiting-text">
    <span class="char char1">기</span>
    <span class="char char2">다</span>
    <span class="char char3">려</span>
    <span class="char char4">주</span>
    <span class="char char5">세</span>
    <span class="char char6">요</span>
  </div>
</div>

<style>
  .waiting-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    margin-top: -100px;
  }

  .waiting-text {
    display: flex;
    gap: 2px;
    font-size: 120px;
    font-weight: bold;
    color: #333;
    position: relative;
    overflow: hidden;
    width: 100vw;
    justify-content: center;
  }

  .char {
    opacity: 0;
    animation: moveAcross 12s infinite linear;
  }

  .char:nth-child(1) {
    animation-delay: 0s;
  }
  .char:nth-child(2) {
    animation-delay: 0.8s;
  }
  .char:nth-child(3) {
    animation-delay: 1.6s;
  }
  .char:nth-child(4) {
    animation-delay: 2.4s;
  }
  .char:nth-child(5) {
    animation-delay: 3.2s;
  }
  .char:nth-child(6) {
    animation-delay: 4s;
  }

  .char1 {
    color: #ffb6c1;
  } /* 연한 분홍 */
  .char2 {
    color: #87ceeb;
  } /* 연한 하늘색 */
  .char3 {
    color: #98fb98;
  } /* 연한 연두색 */
  .char4 {
    color: #dda0dd;
  } /* 연한 보라색 */
  .char5 {
    color: #f0e68c;
  } /* 연한 노란색 */
  .char6 {
    color: #ffa07a;
  } /* 연한 주황색 */

  @keyframes moveAcross {
    0% {
      opacity: 0;
      transform: translateX(50vw) scale(0.5);
    }
    20% {
      opacity: 1;
      transform: translateX(25vw) scale(1);
    }
    80% {
      opacity: 1;
      transform: translateX(-25vw) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateX(-50vw) scale(0.5);
    }
  }

  @media (max-width: 768px) {
    .waiting-text {
      font-size: 60px;
    }
  }
</style> 