<script lang="ts">
  import { onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, USER_CONSTANTS, UserButtons, WaitingAnimation, ConfirmModal } from '$lib'
  import DraggableNumberButtons from './DraggableNumberButtons.svelte'
  import { page } from '$app/state'

  interface ProcessedUser {
    id: string
    username: string
    answerNumber: number
    variant: string
  }

  let { username, users = [] }: { username: string; users?: any[] } = $props()

  let processedUsers = $state<ProcessedUser[]>([
    ...users
      .filter((user: any) => user.username !== ADMIN_NAME)
      .map((user: any) => ({
        id: user.id,
        username: user.username,
        answerNumber: user.answer_number || 0,
        variant: USER_CONSTANTS.DEFAULT_VARIANT,
      })),
  ])

  let userVariants = $state<Record<string, string>>({})

  $effect(() => {
    processedUsers = [
      ...users
        .filter((user: any) => user.username !== ADMIN_NAME)
        .map((user: any) => ({
          id: user.id,
          username: user.username === username ? '나' : user.username,
          answerNumber: user.answer_number || 0,
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
  let answers = $state<Array<{ x: number; y: number; size: number; text?: string; isCorrect: boolean }>>([])
  
  // 세로 정렬 상태 추적 (교사용과 동일하게)
  let isVerticalAlignment = $state(false)



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

      room!.onMessage('__playground_message_types', (message) => {
        // 서버 메시지 처리
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const stateCb = getStateCallbacks(room!)

      stateCb(room!.state).listen('correctNumber', async (_correctNumber) => {
        correctNumber = _correctNumber
        
        if (correctNumber === 0) {
          currentUserAnswerNumber = 0
          isAnswerConfirmed = false
          pendingUserMoves = []
          processedUsers = processedUsers.map(user => ({
            ...user,
            answerNumber: 0
          }))

          const animationManager = (window as any).userAnimationManager
          if (animationManager && animationManager.isReady()) {
            animationManager.resetAnimation()
          }
        }
      })

      stateCb(room!.state).listen('isVerticalAlign', async (_isVerticalAlign) => {
        isVerticalAlignment = _isVerticalAlign
        
        // 애니메이션 매니저에 세로 정렬 상태 전달
        const animationManager = (window as any).userAnimationManager
        if (animationManager && animationManager.isReady()) {
          animationManager.setVerticalAlignment(isVerticalAlignment)
          
          // 현재 사용자들의 위치를 새로운 정렬에 맞게 재조정
          processedUsers.forEach((user, index) => {
            const answerNumber = user.answerNumber ?? 0
            if (answerNumber > 0 && answerNumber <= 4) {
              animationManager.moveSingleUserToNumber(processedUsers, index, answerNumber)
            }
          })
        }
      })

      let pendingAnswerUpdates = new Map<number, { x: number; y: number; size: number; text?: string; isCorrect: boolean }>()
      let updateTimeout: NodeJS.Timeout | null = null

      stateCb(room!.state).currentQuestion.answers.onAdd((answer, index) => {
        if (answer) {
          pendingAnswerUpdates.set(index, {
            x: answer.x,
            y: answer.y,
            size: answer.size,
            text: answer.text || undefined,
            isCorrect: answer.isCorrect
          })
        }
        
        if (updateTimeout) {
          clearTimeout(updateTimeout)
        }
        
        updateTimeout = setTimeout(() => {
          answers = Array.from(pendingAnswerUpdates.values())
          
          // 답안 위치가 변경되면 사용자버튼들 rearrange (AdminRoom과 동일한 방식)
          // 숫자 버튼 이동이 완전히 끝난 후에 재배치 수행
          setTimeout(() => {
            const animationManager = (window as any).userAnimationManager
            if (animationManager && animationManager.isReady()) {
              // 현재 답안을 선택한 사용자들이 있는지 확인
              const usersWithAnswers = processedUsers.filter(user => 
                user.answerNumber > 0 && user.answerNumber <= 4
              )
              
              if (usersWithAnswers.length > 0) {
                // 모든 사용자버튼을 새로운 위치로 rearrange
                processedUsers.forEach((user, index) => {
                  const answerNumber = user.answerNumber
                  if (answerNumber > 0 && answerNumber <= 4) {
                    animationManager.moveSingleUserToNumber(processedUsers, index, answerNumber)
                  }
                })
              }
            }
          }, 800) // 숫자 버튼 이동 완료 후 재배치 (AdminRoom보다 더 긴 지연)
          
          pendingAnswerUpdates.clear()
          updateTimeout = null
        }, 50)
      })

      // 답안 위치 변경 시에도 rearrange 수행 (AdminRoom과 동일)
      stateCb(room!.state).currentQuestion.answers.onChange((answer, index) => {
        if (answer) {
          pendingAnswerUpdates.set(index, {
            x: answer.x,
            y: answer.y,
            size: answer.size,
            text: answer.text || undefined,
            isCorrect: answer.isCorrect
          })
        }
        
        if (updateTimeout) {
          clearTimeout(updateTimeout)
        }
        
        updateTimeout = setTimeout(() => {
          answers = Array.from(pendingAnswerUpdates.values())
          
          // 답안 위치가 변경되면 사용자버튼들 rearrange (AdminRoom과 동일한 방식)
          // 숫자 버튼 이동이 완전히 끝난 후에 재배치 수행
          setTimeout(() => {
            const animationManager = (window as any).userAnimationManager
            if (animationManager && animationManager.isReady()) {
              // 현재 답안을 선택한 사용자들이 있는지 확인
              const usersWithAnswers = processedUsers.filter(user => 
                user.answerNumber > 0 && user.answerNumber <= 4
              )
              
              if (usersWithAnswers.length > 0) {
                // 모든 사용자버튼을 새로운 위치로 rearrange
                processedUsers.forEach((user, index) => {
                  const answerNumber = user.answerNumber
                  if (answerNumber > 0 && answerNumber <= 4) {
                    animationManager.moveSingleUserToNumber(processedUsers, index, answerNumber)
                  }
                })
              }
            }
          }, 800) // 숫자 버튼 이동 완료 후 재배치 (AdminRoom보다 더 긴 지연)
          
          pendingAnswerUpdates.clear()
          updateTimeout = null
        }, 50)
      })

      // 기존 답안들도 처리
      if (room!.state.currentQuestion.answers.length > 0) {
        const existingAnswers = room!.state.currentQuestion.answers
          .filter(answer => answer) // undefined 답안 필터링
          .map((answer, index) => ({
            x: answer.x,
            y: answer.y,
            size: answer.size,
            text: answer.text || undefined,
            isCorrect: answer.isCorrect
          }))
        answers = existingAnswers
      }

      stateCb(room!.state).users.onAdd((user) => {
        const existingUser = processedUsers.find((u) => u.username === user.username)
        if (existingUser && user.username !== username) {
          userVariants = { ...userVariants, [user.username]: 'primary' }
          
          stateCb(user).listen('answerNumber', (answerNumber) => {
            const userIndex = processedUsers.findIndex((u) => u.username === user.username)
            if (userIndex !== -1) {
              if (user.username !== username) {
                if (isAnswerConfirmed) {
                  processedUsers[userIndex] = { ...processedUsers[userIndex], answerNumber }
                  processedUsers = [...processedUsers]
                  
                  const animationManager = (window as any).userAnimationManager
                  if (animationManager && animationManager.isReady()) {
                    if (answerNumber > 0 && answerNumber <= 4) {
                      animationManager.moveSingleUserToNumber(processedUsers, userIndex, answerNumber)
                    } else if (answerNumber === 0) {
                      const currentUser = processedUsers[userIndex]
                      if (currentUser) {
                        animationManager.removeUserFromArrivalOrder(currentUser.username)
                      }
                      animationManager.moveSingleUserToOriginal(processedUsers, userIndex)
                    }
                  }
                } else {
                  pendingUserMoves = [...pendingUserMoves, { userIndex, answerNumber }]
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
        <DraggableNumberButtons
          disabled={isAnswerConfirmed}
          isStudentMode={true}
          receivedButtonPositions={Object.fromEntries(answers.map((answer, index) => [index + 1, {
            x: answer.x,
            y: answer.y,
            size: answer.size,
            text: answer.text
          }]))}

          onNumberClick={async (number: number) => {
            if (isAnswerConfirmed) return
            
            if (currentUserAnswerNumber === number) {
              currentUserAnswerNumber = 0
              room?.send('numberClicked', 0)
            } else {
              currentUserAnswerNumber = number
              room?.send('numberClicked', number)
              isAnswerConfirmed = true
            }
            
            const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
            if (currentUserIndex !== -1) {
              processedUsers = processedUsers.map((user, index) => 
                index === currentUserIndex 
                  ? { ...user, answerNumber: currentUserAnswerNumber }
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
    message={confirmModalData ? `<span style="font-size: 2rem; color: #ef4444; font-weight: normal;">${confirmModalData.targetNumber}</span>번을 선택하셨습니다.` : ''}
    subtitle="이 답안으로 제출하시겠습니까?"
    onCancel={() => {
      showConfirmModal = false
      confirmModalData = null
      currentUserAnswerNumber = 0
      room?.send('numberClicked', 0)
      
      const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
      if (currentUserIndex !== -1) {
        processedUsers = processedUsers.map((user, index) => 
          index === currentUserIndex 
            ? { ...user, answerNumber: 0 }
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
      
      const numberButtonsElement = document.querySelector('[data-component="number-buttons"]')
      if (numberButtonsElement) {
        const numberButtons = numberButtonsElement.querySelectorAll('button')
        numberButtons.forEach(button => {
          button.classList.remove('selected')
        })
      }
    }}
    onConfirm={() => {
      showConfirmModal = false
      confirmModalData = null
      isAnswerConfirmed = true
      
      const animationManager = (window as any).userAnimationManager
      if (animationManager && animationManager.isReady()) {
        pendingUserMoves.forEach(({ userIndex, answerNumber }) => {
          processedUsers[userIndex] = { ...processedUsers[userIndex], answerNumber }
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
    padding: 0;
    margin: 0;
    height: 100vh;
    width: 100vw;
    background-color: #0e1218;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    position: fixed;
    top: 0;
    left: 0;
  }

  .user-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    flex-shrink: 0;
    padding: 10px;
  }

  .component-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    height: calc(100vh - 80px);
    min-height: 400px;
    flex: 1;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

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
