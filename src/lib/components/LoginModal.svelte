<script lang="ts">
  import { appStore, ADMIN_USER } from '$lib'
  import { supabase } from '$lib/supabase'
  import { goto } from '$app/navigation'
  import Modal from './Modal.svelte'

  let modal_open = $state(false)
  let passwordInput: HTMLInputElement
  let loading = $state(false)
  let error = $state('')
  
  async function login(password: string) {
    loading = true
    error = ''

    try {
      // 선생님 이메일로 로그인 (user8@gxg.kro.kr)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'user8@gxg.kro.kr',
        password: password
      })

      if (signInError) {
        error = '비밀번호가 올바르지 않습니다.'
        return
      }

      if (data.user) {
        // 사용자 정보와 점수 정보 가져오기
        const user: any = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || ADMIN_USER
        }

        // 점수 정보 가져오기
        try {
          const { data: scoreData } = await supabase
            .from('scores')
            .select('*')
            .eq('user_id', data.user.id)
            .single()

          if (scoreData) {
            user.score = {
              total_score: scoreData.total_score,
              today_gained_score: scoreData.today_gained_score,
              today_lost_score: scoreData.today_lost_score
            }
          }
        } catch (scoreError) {
          console.log('점수 정보 없음:', scoreError)
        }

        appStore.connect(user)
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
  onclick={() => (modal_open = true)}>{ADMIN_USER} ?</button
>

<Modal {modal_open} onClose={()=>(modal_open=false)}>
  <div class="w-full max-w-md">
    {#if error}
      <div class="alert alert-error mb-4">
        <span>{error}</span>
      </div>
    {/if}

    <form onsubmit={(e) => { e.preventDefault(); login((e.target as HTMLFormElement).password.value); }} class="space-y-4">
      <div class="form-control">
        <input
          id="password"
          bind:this={passwordInput}
          type="password"
          autocomplete="new-password"
          required
          class="input input-bordered w-full focus:outline-none"
          placeholder="비밀번호를 입력하고 엔터키를 누르세요"
        />
      </div>

      {#if loading}
        <div class="flex justify-center">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      {/if}
    </form>
  </div>
</Modal>
