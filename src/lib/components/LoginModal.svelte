<script lang="ts">
  import { appStore, AdminUser } from '$lib'
  import Modal from './Modal.svelte'

  let modal_open = $state(false)
  let passwordInput: HTMLInputElement
  
  async function login(password: string) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: AdminUser, password }),
      })

      if (res.ok) {
        const user = await res.json()
        appStore.connect(user)
      }
    } catch (error) {
      console.error('로그인 실패:', error)
    }
  }

  $effect(() => {
    if (modal_open && passwordInput) {
      passwordInput.focus()
    }
  })
</script>

<button
  class="cursor-pointer hover:text-secondary"
  onclick={() => (modal_open = true)}>{AdminUser} ?</button
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
      bind:this={passwordInput}
      type="password"
      required
      placeholder="비밀번호"
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          login((e.target as HTMLInputElement).value)
          modal_open = false
        }
      }}
    />
  </label>
</Modal>
