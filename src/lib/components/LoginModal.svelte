<script lang="ts">
  import { appStore, ADMIN_NAME, ADMIN_EMAIL, supabase } from '$lib'
  import { goto } from '$app/navigation'
  import { Modal } from '$lib'

  let modal_open = $state(false)
  let passwordInput: HTMLInputElement
  let loading = $state(false)
  let error = $state('')

  async function login(password: string) {
    loading = true
    error = ''

    try {
      // 선생님 이메일로 로그인
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: password,
        })

      if (signInError) {
        error = '비밀번호가 올바르지 않습니다.'
        return
      }

      if (data.user) {
        console.log('data--->', data)
        // 사용자 정보와 점수 정보 가져오기
        const user: any = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || ADMIN_NAME,
        }

        appStore.connect(user)

        // 쿠키에 세션 저장
        const session = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24시간 후 만료
          user: data.user,
        }

        document.cookie = `supabase-auth=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24}; samesite=lax`

        modal_open = false
        goto('/')
      }
    } catch (err: any) {
      error = err.message || '로그인 중 오류가 발생했습니다.'
    } finally {
      loading = false
    }
  }

  function resetForm() {
    error = ''
  }

  $effect(() => {
    if (modal_open && passwordInput) {
      passwordInput.focus()
      resetForm()
    }
  })
</script>

<button
  class="cursor-pointer hover:text-secondary"
  onclick={() => (modal_open = true)}>{ADMIN_NAME} ?</button
>

<Modal {modal_open} onClose={() => (modal_open = false)}>
  <div class="w-full max-w-md">
    {#if error}
      <div class="alert alert-error mb-4">
        <span>{error}</span>
      </div>
    {/if}

    <form
      onsubmit={(e) => {
        e.preventDefault()
        login((e.target as HTMLFormElement).password.value)
      }}
      class="space-y-4"
    >
      <div class="form-control">
        <div class="relative w-full">
          <input
            id="password"
            bind:this={passwordInput}
            type="password"
            autocomplete="new-password"
            required
            class="input input-bordered w-full focus:outline-none pr-10 border-2 border-orange-600 text-xs"
            placeholder="비밀번호를 입력하고 엔터키를 누르세요"
          />
          <span
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
          >
            <!-- 더 작고 심플한 엔터키 아이콘 (예: 유니코드 ⏎) -->
            ⏎
          </span>
        </div>

        {#if loading}
          <div class="flex justify-center">
            <span class="loading loading-spinner loading-md"></span>
          </div>
        {/if}
      </div>
    </form>
  </div>
</Modal>
