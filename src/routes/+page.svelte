<script lang="ts">
  import { appState, QInput, Users, wsStore } from '$lib'
  import QuizView from '$lib/components/QuizView.svelte'
  import { onDestroy, onMount } from 'svelte'
  import type { PageProps } from './$types'
 
  let { data, form }: PageProps = $props()

	onMount(() => {
		if (appState.username !== "Guest")
			wsStore.connect()
	})

	onDestroy(() => {
		wsStore.close()
	})

	let quizState : QuizQuestion | undefined = $state()

	$effect(() => {
		quizState = form?.quiz
	})
</script>

<svelte:head>
	<title>Users List</title>
</svelte:head>

<QInput quiz={quizState} loading={form?.loading}/>


<QuizView quiz={quizState}/>


<Users users={data.users} online_users={wsStore.users}/>
