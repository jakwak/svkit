<script lang="ts">
  import { page } from '$app/state'
  import { appState, LoginModal, wsStore } from '$lib'
  import "../style.css"
  import type { LayoutProps } from "./$types"

  let { children }: LayoutProps = $props()

</script>

<div class={["text-xs whitespace-nowrap text-right mx-auto  absolute top-9 right-9", wsStore.open ? 'text-primary-content' : 'text-zinc-500']}>
  {#if appState.username === "Guest"}
    <LoginModal/>
  {:else}
    <div> {appState.username}</div>
  {/if}
</div>

<header class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end">
  <div class="w-auto mx-auto text-center text-2xl text-primary border-primary">{page.url.pathname === '/' ? 'Home' : 'Quiz'}</div>
</header>


<main class="p-5">
	{@render children()}
</main> 
