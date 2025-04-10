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

  let usersState = $state(users)

  const MAX_SCORE = 50

  const scores = [-10, -5, -4, -3, +3, +4, +5, +10]

  async function handleScoreClick(username: string, today_score: number) {
    let prevScore: number
    usersState.forEach((user) => {
      if (user.username === username) {
        if (!user.score) user.score = { total_score: 0, today_score: 0 }        
        prevScore = user.score.total_score
        if (user.score.total_score + today_score > MAX_SCORE)
          user.score.total_score = MAX_SCORE
        else if (user.score.total_score + today_score < 0)
          user.score.total_score = 0
        else
          user.score.total_score += today_score        
      }
    })

    const result = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, today_score, reason: 'test' }),
    })

    if (!result.ok) {
      console.log('Error:', result.status, result.statusText)
      usersState.forEach((user) => {
        if (user.username === username) {
          user.score.total_score = prevScore
        }
      })
    }
  }
</script>

{#if !show_score}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mx-auto">
    {#each [...usersState].sort( (a, b) => a.username.localeCompare(b.username) ) as user}
      <button
        type="button"
        class={[
          'btn btn-soft btn-primary text-5xl h-30 border-2 border-primary hover:border-secondary-content',
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
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mx-auto w-full"
  >
    {#each [...usersState].sort( (a, b) => a.username.localeCompare(b.username) ) as user}
      <div class="relative group">
        <!-- 유저 박스 -->
        <div
          class="border-1 border-primary text-primary hover:text-secondary p-4 rounded-xl hover:border-secondary items-center flex flex-col space-y-3 select-none"
        >
          <div class="flex items-end">
            <div class="hidden group-hover:block">
              <button type="button" class="cursor-pointer" onclick={() => handleScoreClick(user.username, -1)}>
                <Triangle size={32} color="violet" />
              </button>
            </div>
            <div class="font-bold text-5xl">{user.score?.total_score || 0}</div>
            <div class="hidden group-hover:block">
              <button type="button" class="cursor-pointer" onclick={() => handleScoreClick(user.username, 1)}>
                <Triangle size={32} left={false} color="violet" />
              </button>
            </div>
          </div>
          <div class="font-bold text-5xl">{user.username}</div>
        </div>

        <!-- 버튼 리스트: 유저 박스 하단에 마우스 호버 시 표시 -->
        <!-- <div
          class="absolute left-1/2 -translate-x-1/2 top-[-20%] mt-2 hidden group-hover:flex join z-10"
        >
          {#each scores as score, i}
            <button
              type="button"
              class="btn btn-outline btn-primary text-2xl border-2 w-15 bg-zinc-900 hover:text-secondary
            {i === 0 ? 'rounded-l-2xl border-r-0' : ''}
            {i === scores.length - 1 ? 'rounded-r-2xl' : 'border-r-0'}"
              onclick={() => handleScoreClick(user.username, score)}
            >
              {score > 0 ? `+${score}` : score}
            </button>
          {/each}
        </div> -->

        
      </div>
    {/each}
  </div>
{/if}
