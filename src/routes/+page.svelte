<script lang="ts">
  import { Users, appStore } from '$lib'
  import type { PageProps } from './$types'
  import Talk from '$lib/components/XYInputText.svelte'
  import QuizList2 from '$lib/components/QuizList2.svelte'
  import WorkSheet from '$lib/components/WorkSheet.svelte'
  import GameFrame from '$lib/components/GameFrame.svelte'

  let { data, form }: PageProps = $props()

  // 현재 선택된 탭을 추적하는 변수
  let selectedTab = $state('문제')

  // 탭 변경 핸들러
  function handleTabChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      selectedTab = target.getAttribute('aria-label') || '문제'
    }
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
      checked={true}
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
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      <Users users={data.users} />
    </div>

    <!-- 점수 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="점수"
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '점수'}
        <Users users={data.users} show_score={true} />
      {/if}
    </div>

    <!-- 톡 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="톡"
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '톡'}
        <Talk />
      {/if}
    </div>

    <!-- 게임 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="게임"
      onchange={handleTabChange}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      {#if selectedTab === '게임'}
        <GameFrame username={appStore.username} />
      {/if}
    </div>
  </div>
{:else}
  <div class="max-w-5xl mx-auto">
    <Users users={data.users} />
  </div>
{/if}
