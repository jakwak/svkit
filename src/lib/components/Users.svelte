<script lang="ts">
  import { goto } from '$app/navigation'
import { invalidate } from '$app/navigation'
  import { ADMIN_NAME, appStore, supabase, Triangle } from '$lib'
  import { fade, slide } from 'svelte/transition'

  interface Props {
    users: User[]
    show_score?: boolean
    onUsersUpdate?: (updatedUsers: User[]) => void
  }
  let { users, show_score = false, onUsersUpdate }: Props = $props()

  let usersState = $state(users)
  let showButtons = $state(false)

  const MAX_SCORE = 50

  const scores = [-10, -5, -4, -3, -1, +1, +3, +4, +5, +10]

  async function handleScoreClick(username: string, today_score: number) {
    // 현재 사용자의 점수 상태 저장
    let prevScore: number
    let prevTodayGainedScore: number
    let prevTodayLostScore: number
    
    const targetUser = usersState.find(user => user.username === username)
    if (!targetUser) return
    
    if (!targetUser.score) {
      targetUser.score = { total_score: 0, today_gained_score: 0, today_lost_score: 0 }
    }
    
    prevScore = targetUser.score.total_score
    prevTodayGainedScore = targetUser.score.today_gained_score
    prevTodayLostScore = targetUser.score.today_lost_score
    
    // 50점 이상일 때 +점수는 무시
    if (today_score > 0 && prevScore >= 50) {
      console.log(`${username}의 점수가 이미 50점 이상이므로 +점수를 무시합니다.`)
      return
    }
    
    // 점수 계산 (마이너스 허용)
    const newTotalScore = prevScore + today_score
    const newTodayGainedScore = prevTodayGainedScore + (today_score > 0 ? today_score : 0)
    const newTodayLostScore = prevTodayLostScore + (today_score < 0 ? Math.abs(today_score) : 0)
    
    // UI 즉시 업데이트
    targetUser.score.total_score = newTotalScore
    targetUser.score.today_gained_score = newTodayGainedScore
    targetUser.score.today_lost_score = newTodayLostScore

    try {
      const { data: { session } } = await supabase.auth.getSession()
      let token = session?.access_token
      
      // 토큰이 없거나 만료된 경우 새로고침 시도
      if (!token) {

        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
        token = refreshedSession?.access_token
        
        if (!token) {
          console.error('토큰 새로고침 실패 - 로그인이 필요합니다.')
          // 실패 시 원래 값으로 되돌리기
          targetUser.score.total_score = prevScore
          targetUser.score.today_gained_score = prevTodayGainedScore
          targetUser.score.today_lost_score = prevTodayLostScore
          // 로그인 페이지로 리다이렉트
          window.location.href = '/'
          return
      }
      }

    const result = await fetch('/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ 
          today_score, 
          reason: `점수 변경: ${today_score > 0 ? '+' : ''}${today_score}`,
          username: username
        }),
    })

    if (!result.ok) {
        console.error('점수 업데이트 실패:', result.status, result.statusText)
        
        // 401 오류는 토큰 만료를 의미
        if (result.status === 401) {
          console.error('토큰이 만료되었습니다. 다시 로그인해주세요.')
          // 로그인 페이지로 리다이렉트
          window.location.href = '/'
          return
        }
        
        // 실패 시 원래 값으로 되돌리기
        targetUser.score.total_score = prevScore
        targetUser.score.today_gained_score = prevTodayGainedScore
        targetUser.score.today_lost_score = prevTodayLostScore
      } else {
        console.log('점수 업데이트 성공')
        // 서버 업데이트 성공 시 부모에게 업데이트된 사용자 정보 전달
        if (onUsersUpdate) {
          onUsersUpdate([...usersState])
        }
      }
    } catch (error) {
      console.error('점수 업데이트 오류:', error)
      // 오류 시 원래 값으로 되돌리기
      targetUser.score.total_score = prevScore
      targetUser.score.today_gained_score = prevTodayGainedScore
      targetUser.score.today_lost_score = prevTodayLostScore
    }
  }
</script>

{#if !show_score}
  <div class="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 mx-auto">
    {#each [...usersState].filter(user => user.username !== ADMIN_NAME) as user}
      <button
        type="button"
        class="btn btn-soft btn-primary text-5xl h-30 border-2 border-primary hover:border-secondary-content relative truncate"
        onclick={() => {
          if (!appStore.isAdmin && !appStore.online_users.some((online_user) => online_user === user.username)) {
            console.log('👤 사용자 버튼 클릭:', user.username)
            // 강제 페이지 새로고침으로 자동 로그인 상태 반영
            window.location.href = `/quizz/${encodeURIComponent(user.username)}`
          }
        }}
        ontouchend={() => {
          if (!appStore.isAdmin && !appStore.online_users.some((online_user) => online_user === user.username)) {
            console.log('👤 사용자 버튼 터치:', user.username)
            // 강제 페이지 새로고침으로 자동 로그인 상태 반영
            window.location.href = `/quizz/${encodeURIComponent(user.username)}`
          }
        }}
      >
        <span class="truncate block w-full">{user.username}</span>
        {#if appStore.isOnline(user.username)}
          <div class="online-badge"></div>
        {/if}
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
          class="border-1 border-primary text-primary hover:text-secondary p-4 rounded-xl hover:border-secondary items-center flex flex-col space-y-3 select-none relative"
        >
          {#if appStore.online_users.some((online_user) => online_user === user.username && user.username !== ADMIN_NAME)}
            <div class="online-badge"></div>
          {/if}
          <div class="flex items-center space-x-2">
            <div class="hidden group-hover:block">
              <button type="button" class="cursor-pointer" onclick={() => handleScoreClick(user.username, -1)}>
                <Triangle size={32} color="violet" />
              </button>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center">
                <div class="font-bold text-5xl">{user.score?.total_score || 0}</div>
                <div class="flex flex-col ml-2 text-sm">
                  <div class="text-green-500">+{user.score?.today_gained_score || 0}</div>
                  <div class="text-red-500">-{user.score?.today_lost_score || 0}</div>
                </div>
              </div>
            </div>
            <div class="hidden group-hover:block">
              <button 
                type="button" 
                class="cursor-pointer {(user.score?.total_score || 0) >= 50 ? 'opacity-50' : ''}" 
                onclick={() => handleScoreClick(user.username, 1)}
                disabled={(user.score?.total_score || 0) >= 50}
              >
                <Triangle size={32} left={false} color={(user.score?.total_score || 0) >= 50 ? "gray" : "violet"} />
              </button>
            </div>
          </div>
          <div class="font-bold text-5xl truncate max-w-full text-center">{user.username}</div>
        </div>



        
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
          onclick={() => usersState.forEach(user => {
            // 50점 이상인 사용자는 +점수를 받지 않음
            if (score > 0 && (user.score?.total_score || 0) >= 50) {
              console.log(`${user.username}의 점수가 이미 50점 이상이므로 +${score}점을 무시합니다.`)
              return
            }
            handleScoreClick(user.username, score)
          })}
        >
          {score > 0 ? `+${score}` : score}
        </button>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .online-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 10px;
    height: 10px;
    background-color: #ff6b6b;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* 모바일에서 폰트 크기 조정 */
  @media (max-width: 640px) {
    button {
      font-size: 1.8rem !important;
      line-height: 1.1;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 4rem !important;
      padding: 0.5rem !important;
    }
    
    .grid {
      gap: 0.5rem !important;
      padding: 0.5rem !important;
    }
  }

  /* username이 항상 1줄로 표시되도록 강제 설정 */
  button span,
  .font-bold {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: block !important;
    width: 100% !important;
  }
</style>
