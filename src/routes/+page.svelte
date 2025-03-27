<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, wsStore } from '$lib'
  import type { PageProps } from './$types'
  import Users from '$lib/components/Users.svelte'
  import QInput from '$lib/components/QInput.svelte'
  
  let { data }: PageProps = $props()

	onMount(() => {
		if (appState.username !== "Guest")
			wsStore.connect()
	})

	onDestroy(() => {
		wsStore.close()
	})
</script>

<svelte:head>
	<title>Users List</title>
</svelte:head>

<Users users={data.users} online_users={wsStore.users}/>
