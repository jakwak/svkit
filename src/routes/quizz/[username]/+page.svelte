<script lang="ts">
	import { AdminUser, appStore } from '$lib'
  import { onMount } from 'svelte'
	import type { PageProps } from './$types';
  import QuizShow from '$lib/components/QuizShow.svelte'
  import XyInputText from '$lib/components/XYInputText.svelte'
  
	let { data }: PageProps = $props();

	onMount(() => {
		appStore.connect({username: data.cur_user, id: data.cur_user_id})
		return () => {
			appStore.logout()
		}
	})

</script>

{#if appStore.quiz}
	<QuizShow quiz={appStore.quiz} user_id={data.cur_user_id}/>
{:else if appStore.users.find(username => username === AdminUser)}
	<XyInputText />
{/if}
