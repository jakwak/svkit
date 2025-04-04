<script lang="ts" generics="User extends { id: number, username: string }">
  import { goto } from '$app/navigation'
  import { appState } from '$lib/app_state.svelte'

  interface Props {
    users: User[],
    online_users: string[]
  }
  let { users, online_users }: Props = $props()
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-2xl mx-auto">
  {#each  [...users].sort((a, b) => a.username.localeCompare(b.username)) as user}
    <button
      type="button"
      class={[
        "btn btn-soft btn-primary text-4xl h-20 border-2 border-primary hover:border-secondary-content", 
        online_users.some(online_user => online_user === user.username) ? 'bg-secondary border-secondary text-white font-semibold' : ''
      ]}
      onclick={() => {
        if (appState.username !== "선생님")
          goto(`/quizz/${user.username}`)
      }}
    >
      {user.username}
    </button>
  {/each}
</div>
