<script lang="ts">
  import { ADMIN_USER, appStore } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import QuizShow from '$lib/components/QuizShow.svelte'
  import XyInputText from '$lib/components/XYInputText.svelte'
  import GameFrame from '$lib/components/GameFrame.svelte'
  import { supabase } from '$lib/supabase'

  let { data }: PageProps = $props()

  onMount(() => {
    if (data.cur_user) {
      appStore.connect(data.cur_user)
      // 수업시작 메시지 받기
      appStore.socket?.on('class_start', (data) => {
        console.log('수업 시작!', data)
        showClass = true
      })
      appStore.socket?.on('class_end', (data) => {
        console.log('수업 종료!', data)
        showClass = false
      })
      // show_buttons 메시지 받기
      appStore.socket?.on('show_buttons', (data) => {
        console.log('버튼 표시!', data)
        showButtons = true
      })
    }

    return () => {
      appStore.logout()
    }
  })

  let showGame = $state(false)
  let showClass = $state(false)
  let showButtons = $state(false)

  function handleGameClick() {
    // 게임 버튼 클릭 시 처리
    showGame = true
  }

  function handleClassClick() {
    // 수업 버튼 클릭 시 처리
    showClass = true
  }
</script>

{#if showGame}
  <GameFrame username={appStore.username} bind:showGame />
{:else if showClass}
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
{:else if showButtons}
  <div class="buttons-container">
    <div class="number-buttons">
      <button class="number-button btn-1">1</button>
      <button class="number-button btn-2">2</button>
      <button class="number-button btn-3">3</button>
      <button class="number-button btn-4">4</button>
    </div>
  </div>
{:else}
  <div class="container">
    <div class="button-container">
      <button class="main-button game-button" onclick={handleGameClick}>
        <span class="button-text">게 임</span>
      </button>
      <button class="main-button class-button" onclick={handleClassClick}>
        <span class="button-text">수 업</span>
      </button>
    </div>
  </div>
{/if}

<!-- {#if appStore.quiz}
  <QuizShow
    quiz={appStore.quiz}
    user_id={Number.parseInt(appStore.cur_user.id)}
  /> -->
<!-- {:else if appStore.users.find((username) => username === AdminUser)}
  <XyInputText /> -->
<!-- {:else}
  <GameFrame username={appStore.username} />
{/if} -->

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
    font-weight: bold;
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
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
  }

  .class-button {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    color: white;
  }

  .class-button:hover {
    transform: translateY(-5px);
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
    .button-container {
      flex-direction: column;
      gap: 30px;
    }

    .main-button {
      width: 240px;
      height: 100px;
      font-size: 36px;
    }

    .waiting-text {
      font-size: 60px;
    }

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
