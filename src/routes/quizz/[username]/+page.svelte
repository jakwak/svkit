<script lang="ts">
	import { appState, wsStore } from '$lib'
  import { onMount } from 'svelte'
	import type { PageProps } from './$types';
  import QuizShow from '$lib/components/QuizShow.svelte'
  
	let { data }: PageProps = $props();

	onMount(() => {
		appState.login(data.cur_user)
		return () => {
			appState.logout()
		}
	})

</script>

{#if wsStore.quiz}
	<QuizShow quiz={wsStore.quiz} />
{/if}