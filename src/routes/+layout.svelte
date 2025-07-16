<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { 
    ADMIN_NAME, 
    appStore, 
    GUEST_USER, 
    SupabaseAuth, 
    supabase, 
    LoginModal,
    type User 
  } from '$lib' 
  import { onMount } from 'svelte'
  import '../style.css'
  import type { LayoutProps } from './$types'
  import { SvelteToast } from '@zerodevx/svelte-toast'

  let { children, data }: LayoutProps = $props()

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

  onMount(async () => {
    console.log('🔄 onMount 시작 - 사용자 상태 확인 중...')
    
    // localStorage에서 사용자 정보 확인
    const storedUser = localStorage.getItem('current-user')
    console.log('🔍 localStorage 사용자 확인:', {
      hasStoredUser: !!storedUser,
      storedUser: storedUser
    })
    
    let user = null
    
    if (storedUser) {
      try {
        user = JSON.parse(storedUser)
        console.log('📋 localStorage에서 사용자 복원:', {
          username: user.username,
          id: user.id
        })
      } catch (error) {
        console.error('❌ 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('current-user')
      }
    }
    
    // Supabase 세션도 확인 (백업)
    const { data: { session: supabaseSession }, error } = await supabase.auth.getSession()
    
    console.log('📋 Supabase 세션 확인 결과:', {
      hasSession: !!supabaseSession,
      hasUser: !!supabaseSession?.user,
      userId: supabaseSession?.user?.id,
      userEmail: supabaseSession?.user?.email,
      username: supabaseSession?.user?.user_metadata?.username,
      error: error?.message
    })
    
    // localStorage 사용자 정보가 있으면 그것을 사용, 없으면 Supabase 세션 사용
    const finalUser = user || (supabaseSession?.user ? {
      id: supabaseSession.user.id,
      email: supabaseSession.user.email,
      username: supabaseSession.user.user_metadata?.username || supabaseSession.user.email?.split('@')[0] || GUEST_USER
    } : null)
    
    console.log('📋 최종 사용자 결정:', {
      hasLocalStorageUser: !!user,
      hasSupabaseUser: !!supabaseSession?.user,
      hasFinalUser: !!finalUser,
      finalUsername: finalUser?.username
    })
    
    if (finalUser) {
      // 사용자 정보 설정
      const userInfo: User = {
        id: finalUser.id,
        email: finalUser.email,
        username: finalUser.username || finalUser.email?.split('@')[0] || GUEST_USER
      }

      // 백엔드 API를 통해 점수 정보 가져오기
      try {
        const response = await fetch('/api/scores', {
          headers: {
            'Authorization': `Bearer ${finalUser.access_token || ''}`
          }
        })
        
        if (response.ok) {
          const scoresData = await response.json()
          const userScore = scoresData.find((score: any) => score.id === finalUser.id)
          
          if (userScore?.score) {
            userInfo.score = {
              total_score: userScore.score.total_score,
              today_gained_score: userScore.score.today_gained_score,
              today_lost_score: userScore.score.today_lost_score
            }
          }
        }
      } catch (scoreError) {
        console.log('점수 정보 가져오기 실패:', scoreError)
      }

      // 사용자 연결 및 현재 페이지 유지
      appStore.connect(userInfo)
      console.log('✅ 사용자 복원 완료:', userInfo.username)
    } else {
      // 세션이 없는 경우 게스트로 연결
      appStore.connect({username: GUEST_USER, id: '0'})
      console.log('ℹ️ 게스트 사용자로 연결 - 세션 없음')
    }

    // 인증 상태 변경 감지
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      })
      
      if (event === 'INITIAL_SESSION') {
        console.log('🔄 Supabase 초기 세션 확인:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
        
        // localStorage에서 사용자 정보가 있으면 Supabase 세션 없어도 괜찮음
        const storedUser = localStorage.getItem('current-user')
        if (storedUser) {
          console.log('ℹ️ localStorage에 사용자 정보가 있으므로 Supabase 세션 없어도 정상')
        } else {
          console.log('ℹ️ localStorage에도 사용자 정보가 없음 - 게스트 상태')
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
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
        console.log('✅ 로그인 완료:', user.username)
      } else if (event === 'SIGNED_OUT') {
        appStore.connect({username: GUEST_USER, id: '0'})
        console.log('🚪 로그아웃 완료')
        goto('/')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 토큰 갱신 완료')
      }
    })
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
