<script lang="ts">
  const { onGameClick, onClassClick } = $props<{
    onGameClick: () => void
    onClassClick: () => void
  }>()
</script>

<div class="container">
  <div class="button-container">
    <button class="main-button game-button" onclick={onGameClick}>
      <span class="button-text">게 임</span>
    </button>
    <button class="main-button class-button" onclick={onClassClick}>
      <span class="button-text">수 업</span>
    </button>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    margin-top: 100px;
    align-items: flex-start;
  }

  .button-container {
    display: flex;
    flex-direction: row;
    gap: 40px;
    align-items: center;
  }

  .main-button {
    width: 280px;
    height: 120px;
    border: none;
    border-radius: 25px;
    font-size: 48px;
    font-weight: normal;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .game-button {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
  }

  .game-button:hover {
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
  }

  .class-button {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
  }

  .class-button:hover {
    box-shadow: 0 15px 40px rgba(78, 205, 196, 0.4);
  }

  .button-text {
    position: relative;
    z-index: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .main-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  .main-button:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    .button-container {
      flex-direction: column;
      gap: 30px;
    }

    .main-button {
      width: 240px;
      height: 100px;
      font-size: 36px;
    }
  }
</style> 