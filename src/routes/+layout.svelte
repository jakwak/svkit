<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { AdminUser, appStore, Guest, LoginModal } from '$lib'
  import { onMount } from 'svelte'
  import "../style.css"
  import type { LayoutProps } from "./$types"

  let { data, children }: LayoutProps = $props()

  onMount(() => {
    console.log('cur_user: ', data.cur_user);
    if (data.cur_user.id)
      appStore.connect(data.cur_user);
    return () => {
      appStore.logout()
    }
  })
</script>

<div class={["flex text-xs whitespace-nowrap text-right mx-auto  absolute top-9 right-9", appStore.isAuthenticated ? 'text-primary-content' : 'text-zinc-500']}>
  {#if !appStore.isAuthenticated}
    <LoginModal/>
  {:else}
    <div> {appStore.username}</div>
    <button type="button" onclick={() => {appStore.logout(); goto('/');}} class="text-zinc-500 hover:cursor-pointer"> &nbsp;>>> </button>
  {/if}
</div>

<header class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end">
  <div class="w-auto mx-auto text-center text-2xl text-primary border-primary">{page.url.pathname === '/' ? 'Home' : 'Quiz'}</div>
</header>

<main class="p-5">
	{@render children()}
</main> 
