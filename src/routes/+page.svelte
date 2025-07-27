<script lang="ts">
  import {
    Users,
    appStore,
    XYInputText,
    QuizList2,
    WorkSheet,
    GameFrame,
    AdminRoom
  } from '$lib'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()

  // data.users를 반응형으로 만들기
  let usersData = $state(data.users) as User[]

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
        <AdminRoom />
        <!-- {#if appStore.sessionState === 'start'}
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
            <UserStatusAndClassButtons users={usersData} color={true} />

            <button
              class="end-class-btn"
              onclick={handleEndClass}
              disabled={isTransitioning}
            >
              수업 종료
            </button>
          </div>
        {/if} -->
      {/if}
    </div>

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
      <Users
        users={usersData}
        onUsersUpdate={(updatedUsers) => (usersData = updatedUsers)}
      />
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
        <Users
          users={usersData}
          show_score={true}
          onUsersUpdate={(updatedUsers) => (usersData = updatedUsers)}
        />
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
          <GameFrame username={appStore.username} bind:showGame />
        {:else}
          <Users
            users={usersData}
            show_score={true}
            onUsersUpdate={(updatedUsers) => (usersData = updatedUsers)}
          />
        {/if}
      {/if}
    </div>
  </div>
{:else}
  <Users users={data.users} />
{/if}

<style>
  /* 모든 탭 컨테이너 높이 통일 */
  .tab-content {
    min-height: 500px !important;
  }
</style>
