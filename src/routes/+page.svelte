<script lang="ts">
  import { Users, QuizList, AdminUser, appStore } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import { io } from 'socket.io-client'

  let { data }: PageProps = $props()

  let socket;
  let username = '';
  let message = '';
  let messages: { sender: string; message: string }[] = [];

  // onMount(() => {
  //   socket = io("http://localhost:8000", {
  //     path: "/ws2/socket.io",
  //   });

  //   socket.on('connect', () => {
  //     console.log('✅ Connected to server');
  //   });

  //   socket.on("message", (data) => {
  //     messages = [...messages, data];
  //   });
  // })
</script>

<svelte:head>
  <title>ㅎjㅎ HOME</title>
</svelte:head>

{#if appStore.isAdmin}
  <div class="tabs tabs-border flex justify-center max-w-5xl mx-auto">
    <!-- 문제 탭 -->
    <input
      type="radio"
      name="my_tabs"
      class="tab hover:text-secondary"
      aria-label="문제"
      checked={true}
    />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md space-y-4">
			<QuizList {...data.quizzes}/>
    </div>

    <!-- 학생 탭 -->
    <input type="radio" name="my_tabs" class="tab hover:text-secondary" aria-label="학생" />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      <Users users={data.users} />
    </div>

    <!-- 점수 탭 -->
    <input type="radio" name="my_tabs" class="tab hover:text-secondary" aria-label="점수" />
    <div class="tab-content border-primary border-3 bg-base-100 p-5 rounded-md">
      <Users users={data.users} show_score={true} />
    </div>
  </div>
{:else}
  <div class="max-w-5xl mx-auto">
    <Users users={data.users}/>
  </div>
{/if}
