<script lang="ts">
  import { supabase, appStore, Modal, type User } from '$lib'
  import { goto } from '$app/navigation'

  let modal_open = $state(false)
  let isSignUp = $state(false)
  let username = $state('')
  let password = $state('')
  let email = $state('')
  let loading = $state(false)
  let error = $state('')

  async function handleAuth(event: Event) {
    event.preventDefault()
    loading = true
    error = ''

    try {
      if (isSignUp) {
        // 회원가입 - 이메일이 필요함
        if (!email) {
          error = '회원가입을 위해서는 이메일이 필요합니다.'
          loading = false
          return
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0]
            }
          }
        })

        if (signUpError) throw signUpError

        if (data.user) {
          // 회원가입 성공 시 자동 로그인
          await handleSignIn()
        }
      } else {
        // 로그인 - username으로 로그인
        await handleSignIn()
      }
    } catch (err: any) {
      error = err.message || '인증 중 오류가 발생했습니다.'
    } finally {
      loading = false
    }
  }

  async function handleSignIn() {
    try {
      // 백엔드 API를 통해 username으로 로그인
      const response = await fetch('/api/supabase/signin-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '로그인에 실패했습니다.')
      }

      const data = await response.json()
      

      
      // 백엔드에서 받은 사용자 정보로 직접 세션 생성
      const session = {
        access_token: data.supabase_token,
        refresh_token: data.supabase_refresh_token || data.supabase_token,
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간 후 만료
        user: data.user
      }
      
      // 쿠키에 세션 저장
      document.cookie = `supabase-auth=${JSON.stringify(session)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      
      // Supabase 세션도 설정 시도 (선택사항)
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.supabase_token,
          refresh_token: data.supabase_refresh_token || data.supabase_token
        })
        
        if (sessionError) {
          // Supabase 세션 설정 실패 (무시)
        }
      } catch (error) {
        // Supabase 세션 설정 오류 (무시)
      }

      // 사용자 정보와 점수 정보 가져오기
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username || username
      }

      // 백엔드 API를 통해 점수 정보 가져오기
      try {
        const response = await fetch('/api/scores', {
          headers: {
            'Authorization': `Bearer ${data.supabase_token}`
          }
        })
        
        if (response.ok) {
          const scoresData = await response.json()
          const userScore = scoresData.find((score: any) => score.id === data.user.id)
          
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
      modal_open = false
      goto('/')
    } catch (err: any) {
      throw err
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    appStore.logout()
    goto('/')
  }

  function resetForm() {
    email = ''
    password = ''
    username = ''
    error = ''
  }

  $effect(() => {
    if (modal_open) {
      resetForm()
    }
  })
</script>

<!-- 로그인/회원가입 버튼 -->
<button
  class="cursor-pointer hover:text-secondary"
  onclick={() => (modal_open = true)}
>
  {isSignUp ? '회원가입' : '로그인'}
</button>

<Modal {modal_open} onClose={() => (modal_open = false)}>
  <div class="w-full max-w-md">
    <h2 class="text-2xl font-bold mb-4 text-center">
      {isSignUp ? '회원가입' : '로그인'}
    </h2>

    {#if error}
      <div class="alert alert-error mb-4">
        <span>{error}</span>
      </div>
    {/if}

    <form onsubmit={handleAuth} class="space-y-4">
      <div class="form-control">
        <label class="label" for="username">
          <span class="label-text">사용자명</span>
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required
          class="input input-bordered w-full"
          placeholder="사용자명을 입력하세요"
        />
      </div>

      {#if isSignUp}
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">이메일</span>
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="input input-bordered w-full"
            placeholder="이메일을 입력하세요"
          />
        </div>
      {/if}

      <div class="form-control">
        <label class="label" for="password">
          <span class="label-text">비밀번호</span>
        </label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="input input-bordered w-full"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full"
        disabled={loading}
      >
        {#if loading}
          <span class="loading loading-spinner loading-sm"></span>
        {/if}
        {isSignUp ? '회원가입' : '로그인'}
      </button>
    </form>

    <div class="divider">또는</div>

    <button
      class="btn btn-outline w-full"
      onclick={() => (isSignUp = !isSignUp)}
    >
      {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
    </button>
  </div>
</Modal> 