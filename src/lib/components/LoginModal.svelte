<script lang="ts">
  import { appState, wsStore } from '$lib'
  import Modal from './Modal.svelte'

  let modal_open = $state(false)
  
  async function login(password: string) {
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
</script>

<button
  class="cursor-pointer hover:text-secondary"
  onclick={() => (modal_open = true)}>선생님 ???</button
>

<Modal {modal_open} onClose={()=>(modal_open=false)}>
  <label class="input w-full border-2 border-secondary">
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
        >
        <path
          d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
      </g>
    </svg>
    <input
      type="password"
      required
      placeholder="비밀번호"
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          login((e.target as HTMLInputElement).value)
          modal_open = false
        }
      }}
    />
  </label>
</Modal>
