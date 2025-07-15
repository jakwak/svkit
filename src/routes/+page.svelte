<script lang="ts">
  import { 
    Users, 
    appStore, 
    XYInputText, 
    QuizList2, 
    WorkSheet, 
    GameFrame, 
    ClassButtons, 
    UserStatusList, 
    UserStatusList2 
  } from '$lib'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()

  // data.users를 반응형으로 만들기
  let usersData = $state(data.users)

  // 현재 선택된 탭을 추적하는 변수
  let selectedTab = $state('문제')

  // 탭 변경 핸들러
  function handleTabChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      const tabName = target.getAttribute('aria-label') || '문제'
      selectedTab = tabName
      
      // 게임 탭을 선택하면 showGame을 true로 설정
      if (tabName === '게임') {
        showGame = true
      }

      if (tabName === '수업') {
        appStore.sessionState = 'start'
      }
    }
  }

  let showGame = $state(true)

  $effect(() => {
    if (!showGame) {
      selectedTab = '점수'
    }
  })

  let isTransitioning = $state(false)

  function handleStartClass() {
    // 수업 시작 버튼 클릭 시 처리
    console.log('수업 시작 버튼 클릭됨')
    isTransitioning = true
    appStore.sendClassStart()

    // 페이드 아웃 후 상태 변경 (애니메이션 시간과 동일하게 조정)
    setTimeout(() => {
      isTransitioning = false
    }, 400)
  }
  
  function handleEndClass() {
    // 수업 종료 버튼 클릭 시 처리
    console.log('수업 종료 버튼 클릭됨')
    isTransitioning = true
    
    // 페이드 아웃 후 상태 변경 (애니메이션 시간과 동일하게 조정)
    setTimeout(() => {
      appStore.sendClassEnd()
      isTransitioning = false
    }, 400)
  }
</script>


<svelte:head>
  <title>ㅎjㅎ HOME</title>
</svelte:head>

{#if appStore.isAdmin}
  <div class="tabs tabs-border flex justify-center mx-auto">
    <!-- 문제 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="문제"
      checked={selectedTab === '문제'}
      onchange={handleTabChange}
    />
    <div
      class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md space-y-4"
    >
      <QuizList2 />
    </div>

    <!-- 수업 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="수업"
      checked={selectedTab === '수업'}
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '수업'}
        {#if appStore.sessionState === 'start'}
          <div class="class-container container-fade-in">
            <button 
              class="start-class-btn {isTransitioning ? 'fade-out' : 'fade-in'}" 
              onclick={handleStartClass}
              disabled={isTransitioning}
            >
              <span class="btn-text">수업 시작</span>
            </button>
          </div>
        {:else}
          <div class="class-container-session container-fade-in">
            <!-- <UserStatusList users={usersData} /> -->
            <UserStatusList2 users={usersData} />
            <ClassButtons color={true} />
            
            <button 
              class="end-class-btn" 
              onclick={handleEndClass}
              disabled={isTransitioning}
            >
              수업 종료
            </button>
          </div>
        {/if}
      {/if}
    </div>

    <!-- 문제지 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="문제지"
      checked={selectedTab === '문제지'}
      onchange={handleTabChange}
    />
    <div
      class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md space-y-4"
    >
      <WorkSheet />
    </div>

    <!-- 학생 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="학생"
      checked={selectedTab === '학생'}
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      <Users users={usersData} onUsersUpdate={(updatedUsers) => usersData = updatedUsers} />
    </div>

    <!-- 점수 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="점수"
      checked={selectedTab === '점수'}
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '점수'}
        <Users users={usersData} show_score={true} onUsersUpdate={(updatedUsers) => usersData = updatedUsers} />
      {/if}
    </div>

    <!-- 톡 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="톡"
      checked={selectedTab === '톡'}
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '톡'}
        <XYInputText />
      {/if}
    </div>

    <!-- 게임 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="게임"
      checked={selectedTab === '게임'}
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '게임'}
        {#if showGame}
          <GameFrame username={appStore.username} bind:showGame/>
        {:else}
          <Users users={usersData} show_score={true} onUsersUpdate={(updatedUsers) => usersData = updatedUsers} />
        {/if}
      {/if}
    </div>
  </div>
{:else}
  <Users users={data.users} />
{/if}


<style>
  .start-class-btn {
    width: 400px;
    height: 160px;
    border: none;
    border-radius: 30px;
    font-size: 64px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
    animation: pulse-glow 3s ease-in-out infinite;
  }

  .start-class-btn:hover {
    transform: translate(-50%, -50%) translateY(-12px) scale(1.05);
    box-shadow: 0 25px 60px rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
  }

  .start-class-btn:active {
    transform: translate(-50%, -50%) translateY(-6px) scale(1.02);
    transition: all 0.1s ease;
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
    }
    50% {
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5), 0 0 30px rgba(102, 126, 234, 0.3);
    }
  }

  .btn-text {
    position: relative;
    z-index: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .start-class-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .start-class-btn:hover::before {
    left: 100%;
  }

  .start-class-btn::after {
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

  .start-class-btn:hover::after {
    width: 400px;
    height: 400px;
  }

  .start-class-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: translate(-50%, -50%) !important;
  }

  .start-class-btn:disabled:hover {
    transform: translate(-50%, -50%) !important;
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
  }

  .class-container {
    position: relative;
    height: 500px; /* 고정 높이 설정 */
    width: 100%;
  }

  .class-container-session {
    position: relative;
    height: 500px; /* 고정 높이 설정 */
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px; /* 컴포넌트 간 간격 줄이기 */
  }

  .start-class-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .end-class-btn {
    width: 120px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: center;
    margin-top: auto;
    background: #f5f5f5;
    color: #333;
  }

  .end-class-btn:hover {
    background: #e0e0e0;
    border-color: #999;
  }

  .end-class-btn:active {
    background: #d0d0d0;
  }



  .end-class-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5 !important;
    border-color: #ccc !important;
  }

  /* 페이드 효과 */
  .fade-in {
    animation: fadeIn 0.4s ease-out forwards;
    animation-fill-mode: both;
  }

  .fade-out {
    animation: fadeOut 0.4s ease-in forwards;
    animation-fill-mode: both;
  }

  /* 애니메이션 중 호버 효과 비활성화 */
  .start-class-btn.fade-out:hover {
    transform: translate(-50%, -50%) scale(0.9) !important;
  }

  .start-class-btn.fade-out:active {
    transform: translate(-50%, -50%) scale(0.9) !important;
  }

  /* 클릭 시 즉시 반응 */
  .start-class-btn:active {
    transform: translate(-50%, -50%) scale(0.95) !important;
    transition: transform 0.1s ease !important;
  }

  .end-class-btn:active {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease !important;
  }



  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
  }

  /* 컨테이너 페이드 효과 */
  .container-fade-in {
    animation: containerFadeIn 0.8s ease-in-out;
  }

  @keyframes containerFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 모든 탭 컨테이너 높이 통일 */
  .tab-content {
    min-height: 500px !important;
  }
</style>