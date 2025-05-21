<script lang="ts">
  import { goto } from '$app/navigation'
  import { AdminUser, appStore } from '$lib'
  import Triangle from './Triangle.svelte'
  import { fade, slide } from 'svelte/transition'

  interface Props {
    users: User[]
    show_score?: boolean
  }
  let { users, show_score = false }: Props = $props()

  let usersState = $state(users)
  let showButtons = $state(false)

  const MAX_SCORE = 50

  const scores = [-10, -5, -4, -3, -1, +1, +3, +4, +5, +10]

  async function handleScoreClick(username: string, today_score: number) {
    let prevScore: number
    let prevTodayScore: number
    usersState.forEach((user) => {
      if (user.username === username) {
        if (!user.score) 
          user.score = { total_score: 0, today_score: 0 }        
        prevScore = user.score.total_score
        prevTodayScore = user.score.today_score
        if (user.score.total_score + today_score > MAX_SCORE)
          user.score.total_score = MAX_SCORE
        else if (user.score.total_score + today_score < 0)
          user.score.total_score = 0
        else {
          user.score.total_score += today_score
          user.score.today_score += today_score
        }
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
        if (user.username === username && user.score) {
          user.score.total_score = prevScore
          user.score.today_score = prevTodayScore
        }
      })
    }
  }
</script>

{#if !show_score}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mx-auto">
    {#each [...usersState].filter(user => user.username !== '선생님') as user}
      <button
        type="button"
        class={[
          'btn btn-soft btn-primary text-5xl h-30 border-2 border-primary hover:border-secondary-content',
          appStore.users.some((online_user) => online_user === user.username)
            ? 'bg-secondary border-secondary text-white font-semibold'
            : '',
        ]}
        onclick={() => {
          if (!appStore.isAdmin && !appStore.users.some((online_user) => online_user === user.username)) goto(`/quizz/${user.username}`)
        }}
        ontouchend={() => {
          if (!appStore.isAdmin && !appStore.users.some((online_user) => online_user === user.username)) goto(`/quizz/${user.username}`)
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
    {#each usersState as user}
      <div class="relative group">
        <!-- 유저 박스 -->
        <div
          class="border-1 border-primary text-primary hover:text-secondary p-4 rounded-xl hover:border-secondary items-center flex flex-col space-y-3 select-none 
          {appStore.users.some((online_user) => online_user === user.username && user.username !== AdminUser) ? 'bg-secondary border-secondary text-white font-semibold': ''}"
        >
          <div class="flex items-end">
            <div class="hidden group-hover:block">
              <button type="button" class="cursor-pointer" onclick={() => handleScoreClick(user.username, -1)}>
                <Triangle size={32} color="violet" />
              </button>
            </div>
            <div class="font-bold text-5xl">{user.score?.total_score || 0}<span class='text-lg text-secondary'> {user.score?.today_score}</span></div>
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

  <!-- 전체 리스트 하단 +1/-1 버튼 -->
  <div class="flex justify-center mt-2">
    <button type="button" class="p-1" aria-label="Toggle score adjustment buttons" onclick={() => {
      showButtons = !showButtons;
      const arrow = document.getElementById('toggle-arrow');
      if (arrow) {
        arrow.classList.toggle('rotate-180');
      }
    }}>
      <svg id="toggle-arrow" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
  {#if showButtons}
    <div in:slide={{ duration: 300 }} out:fade={{ duration: 200 }} class="flex justify-center mt-2">
      {#each scores as score, i}
        <button
          type="button"
          class="btn btn-outline btn-primary text-xl border-2 w-12 bg-zinc-900 hover:text-secondary
          {i === 0 ? 'rounded-l-2xl border-r-0' : ''}
          {i === scores.length - 1 ? 'rounded-r-2xl' : 'border-r-0'}"
          onclick={() => usersState.forEach(user => handleScoreClick(user.username, score))}
        >
          {score > 0 ? `+${score}` : score}
        </button>
      {/each}
    </div>
  {/if}
{/if}
