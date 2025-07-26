<script lang="ts">
  import { 
    ADMIN_NAME, 
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
  import KidsRoom from '$lib/components/KidsRoom.svelte'

  let { data }: PageProps = $props()
  const username = data.username;
  const cur_user = data.cur_user;
  
  onMount(() => {
    if (cur_user) {
      appStore.connect(cur_user)
    }

    return async () => {
      appStore.logout()
    }
  })
</script>

<KidsRoom {username} />