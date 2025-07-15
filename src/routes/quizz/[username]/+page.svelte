<script lang="ts">
  import { 
    ADMIN_USER, 
    appStore, 
    QuizShow, 
    XYInputText, 
    GameFrame, 
    MainMenu, 
    WaitingScreen, 
    NumberButtons, 
    PresenceManager 
  } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  onMount(() => {
    if (data.cur_user) {
      appStore.connect(data.cur_user)
      
      // 소켓 이벤트 리스너 설정
      appStore.socket?.on('class_start', (data) => {
        console.log('수업 시작!', data)
        // appStore.startSession()
        appStore.sessionState = 'waiting'
      })
      
      appStore.socket?.on('class_end', (data) => {
        console.log('수업 종료!', data)
        appStore.endSession()
      })
      
      // appStore.socket?.on('show_buttons', (data) => {
      //   console.log('버튼 표시!', data)
      //   appStore.showButtons = true
      // })
      
      // appStore.socket?.on('start_game', (data) => {
      //   console.log('게임 시작!', data)
      //   appStore.startGame()
      // })
      
      // appStore.socket?.on('show_quiz', (data) => {
      //   console.log('문제 제시!', data)
      //   appStore.showQuiz()
      // })
      
      // appStore.socket?.on('show_result', (data) => {
      //   console.log('결과 표시!', data)
      //   appStore.showResult()
      // })
    }

    return async () => {
      appStore.logout()
    }
  })

  function handleGameClick() {
    appStore.startGame()
  }

  function handleClassClick() {
    appStore.startSession()
  }

  function handleParticipationClick() {
    if (typeof window !== 'undefined' && (window as any).updateUserActivity) {
      (window as any).updateUserActivity('수업 참여 중')
    }
  }

  function handleNumberClick(number: number) {
    console.log('숫자 클릭:', number)
    // 숫자 버튼 클릭 시 처리 로직
  }
</script>

<!-- Presence 관리 컴포넌트 (백그라운드에서 실행) -->
<PresenceManager />

<!-- 세션 상태에 따른 컴포넌트 렌더링 -->
{#if appStore.sessionState === 'game'}
  <GameFrame username={appStore.username} />
{:else if appStore.sessionState === 'waiting'}
  <WaitingScreen onParticipationClick={handleParticipationClick} />
{:else if appStore.sessionState === 'quiz'}
  <NumberButtons onNumberClick={handleNumberClick} />
{:else if appStore.sessionState === 'result'}
  <!-- 결과 표시 컴포넌트 (추후 구현) -->
  <div class="result-screen">
    <h2>결과</h2>
    <p>퀴즈 결과가 여기에 표시됩니다.</p>
  </div>
{:else}
  <MainMenu onGameClick={handleGameClick} onClassClick={handleClassClick} />
{/if}

<style>
  .result-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }
  
  .result-screen h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .result-screen p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
</style>
