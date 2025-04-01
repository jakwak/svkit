<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, Modal, wsStore } from '$lib'
  import type { PageProps } from './$types'
  import { Users } from '$lib'
  import { QInput } from '$lib'
  import QuizView from '$lib/components/QuizView.svelte'
 
  let { data, form }: PageProps = $props()

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

<QInput quiz={form?.quiz} loading={form?.loading}/>

<QuizView />

<Users users={data.users} online_users={wsStore.users}/>
