<script lang="ts">
  import { appState, wsStore, Users, QuizList, AdminUser } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'

  let { data, form }: PageProps = $props()
  
  onMount(() => {
    if (appState.username !== 'Guest') wsStore.connect()
    return () => {
      wsStore.close()
      appState.logout()
    }
  })

  // let quizState: QuizQuestion | undefined = $state()

  // $effect(() => {
  //   quizState = form?.quiz
  // })

	// $inspect({quizState, form})
</script>

<svelte:head>
  <title>ㅎjㅎ HOME</title>
</svelte:head>

{#if appState.username === AdminUser}
  <div class="tabs tabs-border flex justify-center max-w-5xl mx-auto">
    <input
      type="radio"
      name="my_tabs_2"
      class="tab hover:text-secondary"
      aria-label="문제"
      checked={true}
    />
    <div class="tab-content border-primary bg-base-100 p-5 rounded-md space-y-4">
			<QuizList {...data.quizzes}/>
    </div>

    <input type="radio" name="my_tabs_2" class="tab hover:text-secondary" aria-label="학생" />
    <div class="tab-content border-primary bg-base-100 p-5 rounded-md">
      <Users users={data.users} online_users={wsStore.users} />
    </div>

    <input type="radio" name="my_tabs_2" class="tab hover:text-secondary" aria-label="점수" />
    <div class="tab-content border-primary bg-base-100 p-5 rounded-md">
      <Users users={data.users} online_users={wsStore.users} show_score={true} />
    </div>
  </div>
{:else}
  <Users users={data.users} online_users={wsStore.users} />
{/if}
