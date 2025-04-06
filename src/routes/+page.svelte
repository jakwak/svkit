<script lang="ts">
  import { appState, QInput, Users, wsStore } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import QuizList from '$lib/components/QuizList.svelte'

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
  <title>Users List</title>
</svelte:head>

<!-- {#if appState.username === '선생님'} -->
  <div class="tabs tabs-border flex justify-center max-w-5xl mx-auto">
    <input
      type="radio"
      name="my_tabs_2"
      class="tab hover:text-secondary"
      aria-label="문제"
      checked={true}
    />
    <div class="tab-content border-primary bg-base-100 p-5 rounded-md space-y-4">
      <!-- <QInput quiz={quizState} loading={form?.loading} /> -->
			<QuizList />
    </div>

    <input type="radio" name="my_tabs_2" class="tab hover:text-secondary" aria-label="학생" />
    <div class="tab-content border-zinc-700 bg-base-100 p-5 rounded-md">
      <Users users={data.users} online_users={wsStore.users} />
    </div>

    <input type="radio" name="my_tabs_2" class="tab hover:text-secondary" aria-label="점수" />
    <div class="tab-content border-zinc-700 bg-base-100 p-5 rounded-md">
      Tab content 3
    </div>
  </div>
<!-- {:else}
  <Users users={data.users} online_users={wsStore.users} />
{/if} -->
