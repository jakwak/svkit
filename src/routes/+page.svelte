<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, wsStore } from '$lib'
  import type { PageProps } from './$types'
  import { Users } from '$lib'
  import { QInput } from '$lib'

  
  let { data, form }: PageProps = $props()

	console.log('form: ', form);
	

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
<QInput/>
<Users users={data.users} online_users={wsStore.users}/>