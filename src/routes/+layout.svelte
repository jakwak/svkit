<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { ADMIN_USER, appStore, GUEST_USER, SupabaseAuth } from '$lib' 
  import { onMount } from 'svelte'
  import '../style.css'
  import type { LayoutProps } from './$types'
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import { supabase } from '$lib/supabase'
  import type { User } from '$lib/globals'
  import LoginModal from '$lib/components/LoginModal.svelte'

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

  onMount(async () => {
    // Supabase 세션 확인
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // 사용자 정보 설정
      const user: User = {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || GUEST_USER
      }

      // 백엔드 API를 통해 점수 정보 가져오기
      try {
        const response = await fetch('/api/scores', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (response.ok) {
          const scoresData = await response.json()
          const userScore = scoresData.find((score: any) => score.id === session.user.id)
          
          if (userScore?.score) {
            user.score = {
              total_score: userScore.score.total_score,
              today_gained_score: userScore.score.today_gained_score,
              today_lost_score: userScore.score.today_lost_score
            }
          }
        }
      } catch (scoreError) {
        console.log('점수 정보 가져오기 실패:', scoreError)
      }

      appStore.connect(user)
    } else {
      appStore.connect({username: GUEST_USER, id: '0'})
    }

    // 인증 상태 변경 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || GUEST_USER
        }

        // 백엔드 API를 통해 점수 정보 가져오기
        try {
          const response = await fetch('/api/scores', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          
          if (response.ok) {
            const scoresData = await response.json()
            const userScore = scoresData.find((score: any) => score.id === session.user.id)
            
            if (userScore?.score) {
                          user.score = {
              total_score: userScore.score.total_score,
              today_gained_score: userScore.score.today_gained_score,
              today_lost_score: userScore.score.today_lost_score
            }
            }
          }
        } catch (scoreError) {
          console.log('점수 정보 가져오기 실패:', scoreError)
        }

        appStore.connect(user)
      } else if (event === 'SIGNED_OUT') {
        appStore.connect({username: GUEST_USER, id: '0'})
      }
    })
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
      onclick={async () => {
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
