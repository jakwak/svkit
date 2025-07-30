<script lang="ts">
  import { onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, USER_CONSTANTS, UserButtons, NumberButtons, WaitingAnimation, ConfirmModal } from '$lib'
  import { page } from '$app/state'

  let { username, users = [] }: { username: string; users?: User[] } = $props()

  // 사용자 데이터 처리
  let processedUsers = $state<Array<User & { variant: string }>>([
    ...users
      .filter((user: User) => user.username !== ADMIN_NAME)
      .map((user: User) => ({
        ...user,
        variant: USER_CONSTANTS.DEFAULT_VARIANT,
      })),
  ])

  let userVariants = $state<Record<string, string>>({})

  // users 데이터가 변경될 때 processedUsers 업데이트
  $effect(() => {
    processedUsers = [
      ...users
        .filter((user: User) => user.username !== ADMIN_NAME)
        .map((user: User) => ({
          ...user,
          username: user.username === username ? '나' : user.username,
          variant: user.username === username ? 'primary' : USER_CONSTANTS.DEFAULT_VARIANT,
        })),
    ]
  })

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let isConnecting = $state(true)
  let connectionError = $state<string | null>(null)
  let correctNumber = $state(0)
  let currentUserAnswerNumber = $state(0)
  let showConfirmModal = $state(false)
  let confirmModalData = $state<{ userIndex: number; targetNumber: number } | null>(null)
  let isAnswerConfirmed = $state(false)
  let pendingUserMoves = $state<Array<{ userIndex: number; answerNumber: number }>>([])

  const cleanupRoom = () => {
    if (room) {
      room.removeAllListeners()
      room.connection.close()
    }
  }

  const initializeRoom = async () => {
    try {
      isConnecting = true
      connectionError = null

      const gameServerUrl = import.meta.env.DEV
        ? 'ws://localhost:2568'
        : import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/'

      client = new Client(gameServerUrl)

      const connectionTimeout = 10000
      const connectionPromise = client.joinOrCreate<MyState>('q_room', {
        username: username,
      })

      room = (await Promise.race([
        connectionPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('연결 타임아웃')), connectionTimeout)
        ),
      ])) as Room<MyState>

      await new Promise((resolve) => setTimeout(resolve, 500))

      const stateCb = getStateCallbacks(room!)

      stateCb(room!.state).listen('correct_number', async (correct_number) => {
        correctNumber = correct_number
        
        if (correct_number === 0) {
          currentUserAnswerNumber = 0
          isAnswerConfirmed = false
          pendingUserMoves = []
          processedUsers = processedUsers.map(user => ({
            ...user,
            answer_number: 0
          }))

          const animationManager = (window as any).userAnimationManager
          if (animationManager && animationManager.isReady()) {
            animationManager.resetAnimation()
          }
        }
      })

      stateCb(room!.state).users.onAdd((user) => {
        const existingUser = processedUsers.find((u) => u.username === user.username)
        if (existingUser && user.username !== username) {
          userVariants = { ...userVariants, [user.username]: 'primary' }
          
          stateCb(user).listen('answer_number', (answer_number) => {
            const userIndex = processedUsers.findIndex((u) => u.username === user.username)
            if (userIndex !== -1) {
              if (user.username !== username) {
                if (isAnswerConfirmed) {
                  processedUsers[userIndex] = { ...processedUsers[userIndex], answer_number }
                  processedUsers = [...processedUsers]
                  
                  const animationManager = (window as any).userAnimationManager
                  if (animationManager && animationManager.isReady()) {
                    if (answer_number > 0 && answer_number <= 4) {
                      animationManager.moveSingleUserToNumber(processedUsers, userIndex, answer_number)
                    } else if (answer_number === 0) {
                      const currentUser = processedUsers[userIndex]
                      if (currentUser) {
                        animationManager.removeUserFromArrivalOrder(currentUser.username)
                      }
                      animationManager.moveSingleUserToOriginal(processedUsers, userIndex)
                    }
                  }
                } else {
                  pendingUserMoves = [...pendingUserMoves, { userIndex, answerNumber: answer_number }]
                }
              }
            }
          })
        }
      })

      stateCb(room!.state).users.onRemove((user) => {
        if (user.username !== username) {
          userVariants = { ...userVariants, [user.username]: 'gray' }
        }
      })

      isConnecting = false
    } catch (error) {
      console.error('연결 실패:', error)
      connectionError = error instanceof Error ? error.message : '연결에 실패했습니다.'
      isConnecting = false

      if (error instanceof Error && error.message.includes('seat reservation expired')) {
        setTimeout(() => {
          if (isConnecting === false) {
            initializeRoom()
          }
        }, 3000)
      }
    }
  }

  // SvelteKit 라우팅 변경 감지
  let previousPath = ''
  $effect(() => {
    if (previousPath.startsWith('/quizz/') && !page.url.pathname.startsWith('/quizz/')) {
      cleanupRoom()
    }
    previousPath = page.url.pathname
  })

  onMount(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      cleanupRoom()
      event.preventDefault()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanupRoom()
        isConnecting = false
      } else if (document.visibilityState === 'visible') {
        initializeRoom()
      }
    }

    const handleUnload = () => {
      cleanupRoom()
    }

    const handlePageHide = () => {
      cleanupRoom()
    }

    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/quizz/')) {
        cleanupRoom()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('unload', handleUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)

    initializeRoom()

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('unload', handleUnload)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('popstate', handlePopState)

      if (room) {
        room.removeAllListeners()
        room.leave()
      }
    }
  })
</script>

{#if isConnecting}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center transform -translate-y-20">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-800 mx-auto mb-6"></div>
      <p class="text-xl font-bold text-white mb-3">서버에 연결 중...</p>
      <p class="text-base text-white">잠시만 기다려주세요</p>
    </div>
  </div>
{:else if connectionError}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="text-red-500 text-6xl mb-4">⚠️</div>
      <p class="text-lg text-gray-700 mb-2">연결 실패</p>
      <p class="text-sm text-gray-500 mb-4">{connectionError}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onclick={() => initializeRoom()}
      >
        다시 시도
      </button>
    </div>
  </div>
{:else}
  <div class="kids-room-container">
    <div class="user-buttons-section">
      <UserButtons users={processedUsers} {userVariants} />
    </div>
    {#if correctNumber !== 0}
      <div class="component-container" data-component="number-buttons">
        <NumberButtons
          disabled={isAnswerConfirmed}
          onNumberClick={async (number) => {
            if (isAnswerConfirmed) return
            
            if (currentUserAnswerNumber === number) {
              currentUserAnswerNumber = 0
              room?.send('number_clicked', 0)
            } else {
              currentUserAnswerNumber = number
              room?.send('number_clicked', number)
              isAnswerConfirmed = true
            }
            
            const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
            if (currentUserIndex !== -1) {
              processedUsers = processedUsers.map((user, index) => 
                index === currentUserIndex 
                  ? { ...user, answer_number: currentUserAnswerNumber }
                  : user
              )

              await new Promise(resolve => setTimeout(resolve, 50))
              
              const animationManager = (window as any).userAnimationManager
              if (animationManager && animationManager.isReady()) {
                if (currentUserAnswerNumber > 0 && currentUserAnswerNumber <= 4) {
                  animationManager.moveSingleUserToNumber(processedUsers, currentUserIndex, currentUserAnswerNumber)
                  
                  setTimeout(() => {
                    confirmModalData = { userIndex: currentUserIndex, targetNumber: currentUserAnswerNumber }
                    showConfirmModal = true
                  }, 1000)
                } else if (currentUserAnswerNumber === 0) {
                  const currentUser = processedUsers[currentUserIndex]
                  if (currentUser) {
                    animationManager.removeUserFromArrivalOrder(currentUser.username)
                  }
                  animationManager.moveSingleUserToOriginal(processedUsers, currentUserIndex)
                  isAnswerConfirmed = false
                }
              }
            }
          }}
        />
      </div>
    {/if}
  </div>

  {#if correctNumber === 0}
    <div class="modal-overlay">
      <div class="modal-content">
        <WaitingAnimation />
      </div>
    </div>
  {/if}

  <ConfirmModal
    show={!!(showConfirmModal && confirmModalData && confirmModalData.targetNumber !== 0)}
    title="답안 확인"
    message={confirmModalData ? `<span style="font-size: 2rem; color: #ef4444; font-weight: bold;">${confirmModalData.targetNumber}</span>번을 선택하셨습니다.` : ''}
    subtitle="이 답안으로 제출하시겠습니까?"
    onCancel={() => {
      showConfirmModal = false
      confirmModalData = null
      currentUserAnswerNumber = 0
      room?.send('number_clicked', 0)
      
      const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
      if (currentUserIndex !== -1) {
        processedUsers = processedUsers.map((user, index) => 
          index === currentUserIndex 
            ? { ...user, answer_number: 0 }
            : user
        )
        
        const animationManager = (window as any).userAnimationManager
        if (animationManager && animationManager.isReady()) {
          const currentUser = processedUsers[currentUserIndex]
          if (currentUser) {
            animationManager.removeUserFromArrivalOrder(currentUser.username)
          }
          animationManager.moveSingleUserToOriginal(processedUsers, currentUserIndex)
        }
      }
      
      isAnswerConfirmed = false
    }}
    onConfirm={() => {
      showConfirmModal = false
      confirmModalData = null
      isAnswerConfirmed = true
      
      const animationManager = (window as any).userAnimationManager
      if (animationManager && animationManager.isReady()) {
        pendingUserMoves.forEach(({ userIndex, answerNumber }) => {
          processedUsers[userIndex] = { ...processedUsers[userIndex], answer_number: answerNumber }
        })
        processedUsers = [...processedUsers]
        
        pendingUserMoves.forEach(({ userIndex, answerNumber }) => {
          if (answerNumber > 0 && answerNumber <= 4) {
            animationManager.moveSingleUserToNumber(processedUsers, userIndex, answerNumber)
          } else if (answerNumber === 0) {
            const currentUser = processedUsers[userIndex]
            if (currentUser) {
              animationManager.removeUserFromArrivalOrder(currentUser.username)
            }
            animationManager.moveSingleUserToOriginal(processedUsers, userIndex)
          }
        })
      }
      
      pendingUserMoves = []
    }}
  />
{/if}

<style>
  .kids-room-container {
    padding: 10px;
    margin: 10px;
    height: calc(100vh - 120px);
    background-color: #0e1218;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .user-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
    flex-shrink: 0;
  }

  .component-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* background-color: rgba(0, 0, 0, 0.3); */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background-color: rgba(31, 41, 55, 0.8);
  }
</style>
