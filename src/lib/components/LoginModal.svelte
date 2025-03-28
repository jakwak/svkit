<script>
  import { clickOutside } from '$lib/clickOutside'
  import { appState, wsStore } from '$lib'

  let password = $state('') // 비밀번호 입력 상태
  let modal_open = $state(false) // 모달 상태

  async function login() {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '선생님', password }),
      })

      if (response.ok) {
        appState.login('선생님')
        wsStore.connect()
      }
    } catch (error) {
      console.error('로그인 실패:', error)
    }
  }

  function handleClickOutside(event) {
    if (!modal_open) return
    modal_open = false
    console.log(event)
  }
</script>

<!-- Open the modal using ID.showModal() method -->
<button class="cursor-pointer hover:text-secondary" onclick={() => modal_open = true}>로그인</button>

<dialog id="my_modal" class={["modal modal-middle", modal_open && 'modal-open']}>
  <div class="modal-box max-w-md"  use:clickOutside onclick_outside={handleClickOutside}>
    <!-- <input
      type="password"
      class="input input-bordered w-full mt-3"
      bind:value={password}
      placeholder="비밀번호 입력"
    /> -->
    <label class="input w-full">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g></svg>      
      <input type="password" required placeholder="Password" bind:value={password} onkeydown={(e) => {
        if (e.key === 'Enter') {login(); modal_open = false}
      }} />
    </label>
  </div>
</dialog>
