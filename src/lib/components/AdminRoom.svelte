<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, appStore } from '$lib'
  import NumberButtons from './NumberButtons.svelte'
  import UsernameButton from './UsernameButton.svelte'
  import { UserAnimationManager } from './UserAnimationManager'
  import { gsap } from 'gsap'

  const { users: initialUsers } = $props<{ users: User[] }>()

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let users = $state([
    ...initialUsers.filter((user: User) => user.username !== ADMIN_NAME),
  ])

  const animationManager = new UserAnimationManager()

  onMount(async () => {
    await connectToServer()

    // 초기 fade-in 애니메이션
    setTimeout(() => {
      animationManager.fadeInButtons()

      // fade-in 애니메이션 완료 후 원래 위치 저장 (더 긴 대기 시간)
      setTimeout(() => {
        const positions = animationManager.saveOriginalPositions()
        animationManager.initialize(positions)
        
      }, 1200) // fade-in 완료 후 더 기다림
    }, 100)
  })

  async function connectToServer() {
    const gameServerUrl = import.meta.env.DEV
      ? 'ws://localhost:2568'
      : import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/'

    client = new Client(gameServerUrl)

    try {
      room = await client.joinOrCreate<MyState>('q_room', {
        username: appStore.username,
      })
    } catch (error) {
      console.error('connectToServer error--->', error)
    }

    const stateCb = getStateCallbacks(room!)

    stateCb(room!.state).users.onAdd((user) => {
      const existingUser = users.find((u) => u.id === user.id)
      if (!existingUser && user.username !== ADMIN_NAME) {
        users = [
          ...users,
          {
            username: user.username,
            id: user.id,
            answer_number: user.answer_number || 0,
          },
        ]
      }
      console.log('onAdd users--->', user)
    })
    stateCb(room!.state).users.onRemove((user) => {
      users = users.filter((u) => u.username !== user.username)
    })

    room!.onMessage('__playground_message_types', (message) => {
      // 메시지 처리
    })
    room!.onMessage('error', (message) => {
      // 에러 처리
    })
    room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
      // 상태 변경 처리
    })
  }

  onDestroy(() => {
    // 모든 GSAP 애니메이션 중지
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf('.user-button-container')
      gsap.killTweensOf('.fade-in-button')
      console.log('모든 애니메이션 중지됨')
    }
    
    room?.leave()
    users = []
  })
</script>

{#if room}
  <!-- <div>AdminRoom- {room.sessionId}</div> -->

  <div class="mb-4">
    <div class="flex flex-wrap gap-2 justify-center">
      {#each users.filter((user) => user.username !== '') as user, index}
        <div
          class="fade-in-button user-button-container"
          style="animation-delay: {index * 0.1}s;"
        >
          <UsernameButton
            username={user.username}
            variant={'gray'}
            size="medium"
            onClick={() => {
              console.log('사용자 클릭:', user.username)
              // 사용자 버튼 클릭 시 해당 사용자의 answer_number를 1-4 중 하나로 변경. 3초후 원래 위치로 돌아가게 하기
              const randomNumber = Math.floor(Math.random() * 4) + 1
              user.answer_number = randomNumber
              animationManager.moveSingleUserToNumber(
                users,
                index,
                randomNumber
              )
              // 이동 완료 후 바로 rearrange 실행
              setTimeout(() => {
                animationManager.rearrangeUsersAfterMove(users)
              }, 600) // 애니메이션 완료 후 바로 실행
              setTimeout(() => {
                user.answer_number = 0
                animationManager.moveSingleUserToOriginal(users, index, () => {
                  animationManager.rearrangeUsersAfterMove(users)
                })
              }, 8000)
            }}
          />
        </div>
      {/each}
    </div>
  </div>

  <div class="number-buttons-container">
    <NumberButtons
      onNumberClick={(number) => {
        console.log('number--->', number)
        // 애니메이션 기능 제거
      }}
    />
  </div>
{:else}
  <div>서버에 접속 중...</div>
{/if}

<style>
  .fade-in-button {
    opacity: 0;
    transform: translateY(20px);
  }

  .user-button-container {
    z-index: 1;
  }

  .number-buttons-container {
    position: relative;
    z-index: 1;
  }
</style>
