<script lang="ts">
  import { goto } from '$app/navigation'
  import { appState } from '$lib/app_state.svelte'
  import Triangle from './Triangle.svelte'

  interface Props {
    users: UserInfo[]
    online_users: string[]
    show_score?: boolean
  }
  let { users, online_users, show_score = false }: Props = $props()
</script>

{#if !show_score}
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-2xl mx-auto"
  >
    {#each [...users].sort( (a, b) => a.username.localeCompare(b.username) ) as user}
      <button
        type="button"
        class={[
          'btn btn-soft btn-primary text-4xl h-20 border-2 border-primary hover:border-secondary-content',
          online_users.some((online_user) => online_user === user.username)
            ? 'bg-secondary border-secondary text-white font-semibold'
            : '',
        ]}
        onclick={() => {
          if (appState.username !== '선생님') goto(`/quizz/${user.username}`)
        }}
      >
        {user.username}
      </button>
    {/each}
  </div>
{/if}

{#if show_score}
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-2xl mx-auto"
  >
    {#each [...users].sort( (a, b) => a.username.localeCompare(b.username) ) as user}
      <div
        class="group text-4xl border-1 border-primary text-primary hover:text-secondary p-4 rounded-xl hover:cursor-pointer hover:border-secondary items-center flex flex-col"
      >
        <div class="flex justify-between items-center">
          <!-- 왼쪽 삼각형: 부모 요소에 호버 시 표시 -->
          <div class="hidden group-hover:block">
            <Triangle color="violet" />
          </div>
          <div class="font-medium text-5xl">
            {user.score?.total_score || 0}
          </div>
          <!-- 오른쪽 삼각형: 부모 요소에 호버 시 표시 -->
          <div class="hidden group-hover:block">
            <Triangle left={false} color="violet" />
          </div>
        </div>
        <div>
          {user.username}
        </div>
      </div>
    {/each}
  </div>
{/if}
