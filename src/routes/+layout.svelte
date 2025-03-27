<script lang="ts">
  import { page } from '$app/state'
	import { appState, wsStore } from '$lib'
  import CurTime from '$lib/components/CurTime.svelte'
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props()

</script>

<header class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end">
  <div class="text-sm w-1/5">User: {appState.username} - {wsStore.open ? 'Connected' : 'Disconnected'}</div>
  <div class="w-full text-center text-2xl text-primary">{page.url.pathname === '/' ? 'Home' : 'Quiz'}</div>
  <div class="w-1/5 text-right">
    <CurTime />
  </div>
</header>
<main class="p-5">
	{@render children()}
</main>

