<script lang="ts">
  import { appStore } from "$lib/appstore.svelte"
  import { onMount } from "svelte";

  export let username: string;
  
  let iframeContainer: HTMLDivElement;
  let isFullscreen = false;

  onMount(() => {
    const updateSize = () => {
      if (iframeContainer) {
        iframeContainer.style.height = `${window.innerHeight}px`;
      }
    };

    const handleFullscreenChange = () => {
      isFullscreen = !!document.fullscreenElement;
    };

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
  <iframe
    id="defold-frame"
    src="/wasm-web/HelloDefold/index.html?username={username}"
    style="border: none;"
    title="Defold Game"
  ></iframe>
  
  <button 
    class="home-button" 
    onclick={() => {
      appStore.logout();
      window.location.href = "/";
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

  /* :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
  } */
</style> 