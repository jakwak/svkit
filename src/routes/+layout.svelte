<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { ADMIN_USER, appStore, GUEST_USER, LoginModal } from '$lib' 
  import { onMount } from 'svelte'
  import '../style.css'
  import type { LayoutProps } from './$types'
  import { SvelteToast } from '@zerodevx/svelte-toast'

  let { children, data }: LayoutProps = $props()

  const options = {
    duration: 4000, // duration of progress bar tween to the `next` value
    initial: 1, // initial progress bar value
    next: 0, // next progress value
    pausable: true, // pause progress bar tween on mouse hover
    dismissable: true, // allow dismiss with close button
    reversed: false, // insert new toast to bottom of stack
    intro: { x: 256 }, // toast intro fly animation settings
    theme: {}, // css var overrides
    classes: [], // user-defined classes
  }

  onMount(() => {
    if (data.cur_user) 
      appStore.connect(data.cur_user) 
    else 
      appStore.connect({username: GUEST_USER, id: '0'})

    // return () => {
    //   appStore.logout()
    // }
  })
</script>

<SvelteToast {options} />

<div
  class={[
    'flex text-xs whitespace-nowrap text-right mx-auto  absolute top-9 right-9',
    appStore.isAuthenticated ? 'text-primary-content' : 'text-zinc-500',
  ]}
>
  {#if !appStore.isAuthenticated}
    <LoginModal />
  {:else}
    <div>{appStore.username}{#if !appStore.isAdmin}({appStore.score?.total_score}){/if}</div>
    <button
      type="button"
      onclick={() => {
        appStore.logout()
        goto('/')
      }}
      class="text-zinc-500 hover:cursor-pointer"
    >
      &nbsp;>>>
    </button>
  {/if}
</div>

<header
  class="flex justify-between gap-4 border-b-2 border-primary px-4 items-end"
>
  <div class="w-auto mx-auto text-center text-3xl text-primary border-primary">
    {#if page.url.pathname === '/'}Home{/if}
    {#if page.url.pathname.startsWith('/quizz')}Quiz{/if}
    {#if page.url.pathname === '/chat'}Chat{/if}
  </div>
</header>

<main class="p-5 max-w-6xl mx-auto">
  {@render children()}
</main>
