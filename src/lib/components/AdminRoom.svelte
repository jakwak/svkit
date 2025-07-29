<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, appStore, USER_CONSTANTS } from '$lib'
  import NumberButtons from './NumberButtons.svelte'
  import UserButtons from './UserButtons.svelte'

  const { users: initialUsers } = $props<{ users: User[] }>()

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let users = $state([
    ...initialUsers
      .filter((user: User) => user.username !== ADMIN_NAME)
      .map((user: User) => ({
        ...user,
        variant: USER_CONSTANTS.DEFAULT_VARIANT,
      })),
  ])

  // 사용자별 variant를 별도로 관리
  let userVariants = $state<Record<string, string>>({})

  // 현재 correct_number 상태 추적
  let currentCorrectNumber = $state(0)

  onMount(async () => {
    await connectToServer()
  })

  async function connectToServer() {
    const gameServerUrl = import.meta.env.DEV
      ? 'ws://localhost:2568'
      : import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/'

    client = new Client(gameServerUrl)

    room = await client.joinOrCreate<MyState>('q_room', {
      username: appStore.username,
    })

    // room!.onStateChange((state) => {
    //   console.log('correct_number 1--->', state.correct_number)
    // })

    const stateCb = getStateCallbacks(room!)

    // stateCb(room!.state).listen(
    //   'correct_number',
    //   (correct_number, previous_correct_number) => {
    //     console.log(
    //       'Listen correct_number--->',
    //       correct_number,
    //       previous_correct_number
    //     )
    //   }
    // )

    stateCb(room!.state).users.onAdd((user) => {
      // 기존 users에서 username이 일치하는 사용자 찾기
      const existingUser = users.find((u) => u.username === user.username)
      if (existingUser) {
        userVariants = { ...userVariants, [user.username]: 'primary' }

        stateCb(user).listen(
          'answer_number',
          (answer_number, previous_answer_number) => {
            // 사용자의 answer_number 업데이트
            const userIndex = users.findIndex(
              (u) => u.username === user.username
            )
            if (userIndex !== -1) {
              const previousAnswerNumber = users[userIndex].answer_number ?? 0

              // 사용자 정보 업데이트
              users[userIndex] = { ...users[userIndex], answer_number }
              users = [...users] // 반응성 트리거

              // 애니메이션 매니저가 준비되었는지 확인
              const animationManager = (window as any).userAnimationManager
              if (animationManager && animationManager.isReady()) {
                if (answer_number > 0 && answer_number <= 4) {
                  // 사용자가 숫자 버튼으로 이동
                  animationManager.moveSingleUserToNumber(
                    users,
                    userIndex,
                    answer_number
                  )
                } else if (previousAnswerNumber > 0 && answer_number === 0) {
                  // 사용자가 원래 위치로 돌아감
                  const currentUser = users[userIndex]
                  if (currentUser) {
                    animationManager.removeUserFromArrivalOrder(currentUser.username)
                  }
                  animationManager.moveSingleUserToOriginal(users, userIndex)
                }
              }
            }
          }
        )
      }
    })
    stateCb(room!.state).users.onRemove((user) => {
      userVariants = { ...userVariants, [user.username]: 'gray' }
    })

    room!.onMessage('__playground_message_types', (message) => {
      // 메시지 처리
    })
    room!.onMessage('error', (message) => {
      // 에러 처리
    })
    // room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
    //   // 상태 변경 처리
    //   currentCorrectNumber = correct_number

    //   // correct_number가 0이 되면 모든 사용자를 원위치로 이동
    //   if (correct_number === 0) {
    //     // 모든 사용자의 answer_number를 0으로 초기화
    //     users = users.map((user) => ({
    //       ...user,
    //       answer_number: 0,
    //     }))

    //     // 애니메이션 매니저가 준비되었는지 확인
    //     const animationManager = (window as any).userAnimationManager
    //     if (animationManager && animationManager.isReady()) {
    //       // 모든 사용자를 원래 위치로 이동
    //       users.forEach((user, index) => {
    //         animationManager.moveSingleUserToOriginal(users, index)
    //       })
    //     }
    //   }
    // })
  }

  onDestroy(() => {
    room?.leave()
    users = []
  })
</script>

{#if room}
  <div class="admin-room-container">
    <div class="user-buttons-section">
      <UserButtons {users} {userVariants} />
    </div>

    <div class="number-buttons-section">
      <NumberButtons
        onNumberClick={(number) => {
          currentCorrectNumber = currentCorrectNumber === number ? 0 : number

          room?.send('correct_number', currentCorrectNumber)

          // correct_number가 0이 되면 모든 사용자를 원위치로 이동
          if (currentCorrectNumber === 0) {
            // 모든 사용자의 answer_number를 0으로 초기화
            users = users.map((user) => ({
              ...user,
              answer_number: 0,
            }))

            // 애니메이션 매니저가 준비되었는지 확인
            const animationManager = (window as any).userAnimationManager
            if (animationManager && animationManager.isReady()) {
              // 모든 사용자를 원래 위치로 이동
              users.forEach((user, index) => {
                animationManager.moveSingleUserToOriginal(users, index)
              })
            }
          }
        }}
      />
    </div>
  </div>
{:else}
  <div class="loading-container">
    <div class="loading loading-spinner loading-lg"></div>
    <p class="mt-4">서버에 접속 중...</p>
  </div>
{/if}

<style>
  .admin-room-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .user-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .number-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }
</style>
