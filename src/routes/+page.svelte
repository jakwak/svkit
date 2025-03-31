<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, wsStore } from '$lib'
  import type { PageProps } from './$types'
  import { Users } from '$lib'
  import { QInput } from '$lib'
 
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
{#if form?.quiz.detail}
	<div class="alert alert-success shadow-lg">
		<div>	
			<div class="flex gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-16 h-16 stroke-current">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				{JSON.stringify(form?.quiz, null, 2)}
			</div>
		</div>
	</div>
{/if}
<QInput quiz={form?.quiz} loading={form?.loading}/>
<Users users={data.users} online_users={wsStore.users}/>