<script lang="ts">
  import "../style.css";
  import { page } from '$app/state'
	import { appState, wsStore } from '$lib'
  import CurTime from '$lib/components/CurTime.svelte'
  import type { LayoutProps } from "./$types";
  import LoginModal from '$lib/components/LoginModal.svelte'
  let { children }: LayoutProps = $props()

</script>

<div class={["text-xs whitespace-nowrap text-right mx-auto  absolute top-8 right-7 h-5", wsStore.open ? 'text-primary-content' : 'text-zinc-500']}>
  {#if appState.username === "Guest"}
    <LoginModal/>
  {:else}
    <div> User: {appState.username}</div>
  {/if}
</div>

<header class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end">
  <div class="w-auto mx-auto text-center text-2xl text-primary border-primary">{page.url.pathname === '/' ? 'Home' : 'Quiz'}</div>
</header>


<main class="p-5">
	{@render children()}
</main> 
