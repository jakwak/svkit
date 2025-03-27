<script lang="ts">
  import { page } from '$app/state'
	import { appState, wsStore } from '$lib'
  import CurTime from '$lib/components/CurTime.svelte'
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props()

</script>

<div class={["text-xs whitespace-nowrap text-right mx-auto  absolute top-8 right-7 h-5", wsStore.open ? 'text-primary-content' : 'text-zinc-500']}>
  {#if appState.username === "Guest"}
    로그인
  {:else}
    <div> User: {appState.username}</div>
  {/if}
</div>

<dialog id="my_modal_1" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

<header class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end">
  <div class="w-auto mx-auto text-center text-2xl text-primary border-primary">{page.url.pathname === '/' ? 'Home' : 'Quiz'}</div>
</header>


<main class="p-5">
	{@render children()}
</main> 
