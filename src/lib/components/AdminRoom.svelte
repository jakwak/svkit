<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, appStore, USER_CONSTANTS } from '$lib'
  import DraggableNumberButtons from './DraggableNumberButtons.svelte'
  import UserButtons from './UserButtons.svelte'
  import AdminToolSet from './AdminToolSet.svelte'

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

  // 현재 correctNumber 상태 추적
  let currentCorrectNumber = $state(0)
  
  // 숫자 버튼 정렬 상태 추적
  let isVerticalAlignment = $state(false)

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
          'answerNumber',
          (answerNumber, previousAnswerNumber) => {
            // 사용자의 answerNumber 업데이트
            const userIndex = users.findIndex(
              (u) => u.username === user.username
            )
            if (userIndex !== -1) {
              const previousAnswerNumber = users[userIndex].answerNumber ?? 0

              // 사용자 정보 업데이트
              users[userIndex] = { ...users[userIndex], answerNumber }
              users = [...users] // 반응성 트리거

              // 애니메이션 매니저가 준비되었는지 확인
              const animationManager = (window as any).userAnimationManager
              if (animationManager && animationManager.isReady()) {
                if (answerNumber > 0 && answerNumber <= 4) {
                  // 사용자가 숫자 버튼으로 이동
                  animationManager.moveSingleUserToNumber(
                    users,
                    userIndex,
                    answerNumber
                  )
                } else if (previousAnswerNumber > 0 && answerNumber === 0) {
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
      <DraggableNumberButtons
        onNumberClick={(number: number) => {
          currentCorrectNumber = currentCorrectNumber === number ? 0 : number

          room?.send('correctNumber', currentCorrectNumber)

          // correctNumber가 0이 되면 모든 사용자를 원위치로 이동
          if (currentCorrectNumber === 0) {
            // 모든 사용자의 answerNumber를 0으로 초기화
            users = users.map((user) => ({
              ...user,
              answerNumber: 0,
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
        onAlignmentChange={(isVertical: boolean) => {
          isVerticalAlignment = isVertical
          
          // 애니메이션 매니저에 세로 정렬 상태 전달
          const animationManager = (window as any).userAnimationManager
          if (animationManager && animationManager.isReady()) {
            animationManager.setVerticalAlignment(isVertical)
            
            // 현재 사용자들의 위치를 새로운 정렬에 맞게 재조정
            users.forEach((user, index) => {
              const answerNumber = user.answerNumber ?? 0
              if (answerNumber > 0 && answerNumber <= 4) {
                animationManager.moveSingleUserToNumber(users, index, answerNumber)
              }
            })
          }
        }}
        onSendButtonPositions={(positions) => {
          // 버튼 위치 정보를 서버로 전송
          room?.send('buttonPositions', positions)
          console.log('버튼 위치 전송:', positions)
        }}
      />
      
      <AdminToolSet
        isVerticalAlignment={isVerticalAlignment}
        onHorizontalAlign={() => {
          // DraggableNumberButtons의 resetToInitialPositions 함수를 직접 호출
          const draggableComponent = document.querySelector('.number-buttons-section')?.querySelector('.buttons-container')
          if (draggableComponent) {
            // 컴포넌트의 메서드를 호출하는 방법이 필요하므로 이벤트를 통해 처리
            const event = new CustomEvent('horizontalAlign')
            draggableComponent.dispatchEvent(event)
          }
        }}
        onVerticalAlign={() => {
          // DraggableNumberButtons의 alignVertically 함수를 직접 호출
          const draggableComponent = document.querySelector('.number-buttons-section')?.querySelector('.buttons-container')
          if (draggableComponent) {
            const event = new CustomEvent('verticalAlign')
            draggableComponent.dispatchEvent(event)
          }
        }}
      />
      
      <!-- 전송 버튼 -->
      <button
        class="send-button"
        class:disabled={currentCorrectNumber === 0}
        title="버튼 위치 전송"
        aria-label="버튼 위치 전송"
        disabled={currentCorrectNumber === 0}
        onclick={() => {
          // DraggableNumberButtons에서 현재 버튼 위치 정보를 가져와서 전송
          const draggableComponent = document.querySelector('.number-buttons-section')?.querySelector('.buttons-container')
          if (draggableComponent) {
            // 전송 이벤트를 발생시켜서 DraggableNumberButtons의 전송 기능을 호출
            const event = new CustomEvent('sendButtonPositions')
            draggableComponent.dispatchEvent(event)
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
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
    gap: 0.25rem;
    height: calc(100vh - 150px);
    overflow: hidden;
    padding: 5px;
  }

  .user-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.1rem;
    margin-top: 1rem;
    flex-shrink: 0;
  }

  .number-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    width: 100%;
    height: calc(100vh - 150px);
    margin-top: -0.5rem;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  .send-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .send-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  .send-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
  }

  .send-button svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .send-button.disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: 0 2px 8px rgba(156, 163, 175, 0.3);
  }

  .send-button.disabled:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(156, 163, 175, 0.3);
  }

</style>
