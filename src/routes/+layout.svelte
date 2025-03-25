<script lang="ts">
  import { appState } from "$lib/app_state.svelte"
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props()

</script>

<header class="p-4 border border-zinc-700">
  <h1>User: {appState.username}</h1>
  <p>data: {JSON.stringify(data)}</p>
</header>
<main class="p-5">
	{@render children()}
</main>

