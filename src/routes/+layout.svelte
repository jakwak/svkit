<script lang="ts">
	import { appState } from '$lib'
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props()

</script>


<header class="flex justify-between gap-4 border-b-1 border-primary px-4">
  <div class="text-sm">User: {appState.username} </div>
  <div>???</div>
  <div>???</div>
</header>
<main class="p-5">
	{@render children()}
</main>

