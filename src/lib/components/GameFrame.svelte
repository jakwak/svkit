<script lang="ts">
  import { appStore } from "$lib/appstore.svelte"
  import { onMount } from "svelte";

  let { username, showGame = $bindable(false) } = $props();
  
  let iframeContainer: HTMLDivElement;
  let isFullscreen = $state(false);
  let gameLoaded = $state(false);
  let gameError = $state(false);

  onMount(() => {
    const updateSize = () => {
      if (iframeContainer) {
        iframeContainer.style.height = `${window.innerHeight}px`;
      }
    };

    const handleFullscreenChange = () => {
      isFullscreen = !!document.fullscreenElement;
    };

    // WebGL 지원 확인
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGLSupport()) {
      console.error('WebGL is not supported in this browser');
      alert('WebGL이 지원되지 않는 브라우저입니다. 게임을 실행할 수 없습니다.');
      showGame = false;
      return;
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', updateSize);
    updateSize();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', updateSize);
    };
  });

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      try {
        await iframeContainer.requestFullscreen();
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      await document.exitFullscreen();
    }
  }
</script>

<div 
  bind:this={iframeContainer} 
  class="iframe-container"
>
  {#if gameError}
    <div class="error-container">
      <h2>게임 로딩 실패</h2>
      <p>WebGL 오류가 발생했습니다. 다음을 확인해주세요:</p>
      <ul>
        <li>브라우저가 WebGL을 지원하는지 확인</li>
        <li>하드웨어 가속이 활성화되어 있는지 확인</li>
        <li>다른 탭을 닫고 다시 시도</li>
      </ul>
      <button onclick={() => { gameError = false; gameLoaded = false; }}>다시 시도</button>
      <button onclick={() => { showGame = false; }}>닫기</button>
    </div>
  {:else}
    {#if !gameLoaded}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>게임을 로딩중입니다...</p>
      </div>
    {/if}
    
    <iframe
      id="defold-frame"
      src="/wasm-web/HelloDefold/index.html?username={username}"
      style="border: none; {gameLoaded ? 'opacity: 1;' : 'opacity: 0;'}"
      title="Defold Game"
      onload={() => {
        console.log('Game iframe loaded successfully');
        gameLoaded = true;
        gameError = false;
      }}
      onerror={() => {
        console.error('Failed to load game iframe');
        gameError = true;
        gameLoaded = false;
      }}
    ></iframe>
  {/if}
  
  <button 
    class="home-button" 
    onclick={() => {
      showGame = false;
    }}
    aria-label="홈으로 이동"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </button>

  <button 
    class="fullscreen-button" 
    onclick={toggleFullscreen}
    aria-label={isFullscreen ? "전체화면 종료" : "전체화면 시작"}
  >
    {#if isFullscreen}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  .iframe-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  .fullscreen-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background-color 0.2s;
    z-index: 1000;
  }

  .home-button {
    position: fixed;
    bottom: 20px;
    right: 60px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background-color 0.2s;
    z-index: 1000;
  }

  .fullscreen-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .fullscreen-button svg {
    width: 24px;
    height: 24px;
  }

  .error-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
    max-width: 500px;
    z-index: 1000;
  }

  .error-container h2 {
    color: #ff6b6b;
    margin-bottom: 1rem;
  }

  .error-container ul {
    text-align: left;
    margin: 1rem 0;
  }

  .error-container button {
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .error-container button:first-of-type {
    background: #4ecdc4;
    color: white;
  }

  .error-container button:last-of-type {
    background: #ff6b6b;
    color: white;
  }

  .loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    z-index: 999;
  }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style> 