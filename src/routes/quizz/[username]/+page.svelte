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

  const { data }: PageProps = $props()
  const { username, currentUser } = data
  
  onMount(() => {
    if (currentUser) {
      appStore.connect(currentUser)
    }

    return () => {
      appStore.logout()
    }
  })
</script>

<KidsRoom {username} />