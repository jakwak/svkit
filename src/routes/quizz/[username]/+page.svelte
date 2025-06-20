<script lang="ts">
  import { AdminUser, appStore } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import QuizShow from '$lib/components/QuizShow.svelte'
  import XyInputText from '$lib/components/XYInputText.svelte'
  import GameFrame from '$lib/components/GameFrame.svelte'

  let { data }: PageProps = $props()

  onMount(() => {
    if (data.cur_user) appStore.connect(data.cur_user)

    return () => {
      appStore.logout()
    }
  })
</script>

{#if appStore.quiz}
  <QuizShow
    quiz={appStore.quiz}
    user_id={Number.parseInt(appStore.cur_user.id)}
  />
<!-- {:else if appStore.users.find((username) => username === AdminUser)}
  <XyInputText /> -->
{:else}
  <GameFrame username={appStore.username} />
{/if}
