<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { 
    ADMIN_NAME, 
    appStore, 
    GUEST_USER, 
    SupabaseAuth, 
    supabase, 
    LoginModal
  } from '$lib' 
  import { onMount } from 'svelte'
  import '../style.css'
  import type { LayoutProps } from './$types'
  import { SvelteToast } from '@zerodevx/svelte-toast'

  const { children, data }: LayoutProps = $props()

  const svelteToastOptions = {
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

  // 서버 상태와 클라이언트 상태 동기화 (최적화)
  let lastUserState = $state<string | null>(null)
  
  $effect(() => {
    const currentUser = data.currentUser
    const currentUsername = currentUser?.username || GUEST_USER
    
    // 상태가 실제로 변경된 경우에만 업데이트
    if (currentUsername !== lastUserState) {
      lastUserState = currentUsername
      
      if (currentUser) {
        appStore.connect(currentUser)
        console.log('✅ 레이아웃 사용자 상태 업데이트:', currentUser.username)
      } else {
        appStore.connect({ username: GUEST_USER, id: '0' })
        console.log('✅ 레이아웃 게스트 상태로 업데이트')
      }
    }
  })

  // 페이지 로드 시 초기 상태 설정
  onMount(() => {
    const currentUser = data.currentUser
    if (currentUser && currentUser.username !== appStore.username) {
      appStore.connect(currentUser)
      console.log('✅ 초기 사용자 상태 설정:', currentUser.username)
    }
  })

  // URL 변경 감지하여 자동 로그인 상태 확인
  $effect(() => {
    const pathname = page.url.pathname
    if (pathname.startsWith('/quizz/')) {
      // /quizz/ 경로에서 자동 로그인 상태 확인
      const username = decodeURIComponent(pathname.split('/')[2])
      if (username && username !== appStore.username && username !== GUEST_USER) {
        console.log('🔄 자동 로그인 감지:', username)
        // 잠시 후 상태 재확인
        setTimeout(() => {
          if (data.currentUser?.username === username) {
            appStore.connect(data.currentUser)
            console.log('✅ 자동 로그인 완료:', username)
          }
        }, 100)
      }
    }
  })
</script>

<SvelteToast options={svelteToastOptions} />

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
      onclick={async () => {
        await appStore.logout()
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
