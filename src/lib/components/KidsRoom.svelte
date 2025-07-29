<script lang="ts">
  import { onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, USER_CONSTANTS } from '$lib'
  import { page } from '$app/state'
  import UserButtons from './UserButtons.svelte'
  import NumberButtons from './NumberButtons.svelte'
  import WaitingAnimation from './WaitingAnimation.svelte'
  import { gsap } from 'gsap'

  let { username, users = [] }: { username: string; users?: User[] } = $props()

  // AdminRoom과 같은 방식으로 사용자 데이터 처리
  let processedUsers = $state<Array<User & { variant: string }>>([
    ...users
      .filter((user: User) => user.username !== ADMIN_NAME)
      .map((user: User) => ({
        ...user,
        variant: USER_CONSTANTS.DEFAULT_VARIANT,
      })),
  ])

  // 사용자별 variant를 별도로 관리
  let userVariants = $state<Record<string, string>>({})

  // users 데이터가 변경될 때 processedUsers 업데이트
  $effect(() => {
    processedUsers = [
      ...users
        .filter((user: User) => user.username !== ADMIN_NAME)
        .map((user: User) => ({
          ...user,
          // 현재 사용자의 username을 '나'로 변경
          username: user.username === username ? '나' : user.username,
          // 현재 사용자의 variant를 'primary'로 설정
          variant:
            user.username === username
              ? 'primary'
              : USER_CONSTANTS.DEFAULT_VARIANT,
        })),
    ]
  })

  // 사용자들의 answer_number 변경 시 애니메이션 트리거
  $effect(() => {
    const animationManager = (window as any).userAnimationManager
    if (animationManager && animationManager.isReady()) {
      processedUsers.forEach((user, index) => {
        const answerNumber = user.answer_number ?? 0
        
        if (answerNumber > 0 && answerNumber <= 4) {
          // 사용자가 숫자 버튼으로 이동
          animationManager.moveSingleUserToNumber(processedUsers, index, answerNumber)
        } else if (answerNumber === 0) {
          // 사용자가 원래 위치로 돌아감
          animationManager.moveSingleUserToOriginal(processedUsers, index)
        }
      })
    }
  })

  // currentUserAnswerNumber 변경 시 애니메이션 트리거 (추가)
  $effect(() => {
    const animationManager = (window as any).userAnimationManager
    if (animationManager && animationManager.isReady()) {
      const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
      if (currentUserIndex !== -1) {
        const answerNumber = currentUserAnswerNumber
        
        if (answerNumber > 0 && answerNumber <= 4) {
          // 사용자가 숫자 버튼으로 이동
          animationManager.moveSingleUserToNumber(processedUsers, currentUserIndex, answerNumber)
        } else if (answerNumber === 0) {
          // 사용자가 원래 위치로 돌아감
          animationManager.moveSingleUserToOriginal(processedUsers, currentUserIndex)
        }
      }
    }
  })

  // 애니메이션 매니저가 준비될 때까지 대기하는 함수
  const waitForAnimationManager = () => {
    return new Promise<void>((resolve) => {
      const checkManager = () => {
        const animationManager = (window as any).userAnimationManager
        if (animationManager && animationManager.isReady()) {
          resolve()
        } else {
          setTimeout(checkManager, 100)
        }
      }
      checkManager()
    })
  }

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let isConnecting = $state(true)
  let connectionError = $state<string | null>(null)
  let correctNumber = $state(0)
  let previousCorrectNumber = $state(0)
  let currentUserAnswerNumber = $state(0)

  // 정리 작업 함수
  const cleanupRoom = () => {
    if (room) {
      room.removeAllListeners()
      room.connection.close()
    }
  }

  // 방 초기화 함수
  const initializeRoom = async () => {
    try {
      isConnecting = true
      connectionError = null

      // 개발 환경에서는 localhost, 프로덕션에서는 환경변수 사용
      const gameServerUrl = import.meta.env.DEV
        ? 'ws://localhost:2568'
        : import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/'

      client = new Client(gameServerUrl)

      // 연결 타임아웃 설정
      const connectionTimeout = 10000 // 10초
      const connectionPromise = client.joinOrCreate<MyState>('q_room', {
        username: username,
      })

      // 타임아웃과 연결을 동시에 처리
      room = (await Promise.race([
        connectionPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('연결 타임아웃')),
            connectionTimeout
          )
        ),
      ])) as Room<MyState>

      // 테스트용 1초 지연
      await new Promise((resolve) => setTimeout(resolve, 500))

      room.onMessage('__playground_message_types', (message) => {
        // 메시지 처리
      })

      const stateCb = getStateCallbacks(room!)

      stateCb(room!.state).listen(
        'correct_number',
        async (correct_number, previous_correct_number) => {
          previousCorrectNumber = correctNumber
          correctNumber = correct_number
          
          // correctNumber가 0이 되면 모든 사용자를 원위치로 이동
          if (correct_number === 0) {
            // 현재 사용자의 answer_number도 0으로 초기화
            currentUserAnswerNumber = 0
            
            // 모든 사용자의 answer_number를 0으로 초기화
            processedUsers = processedUsers.map(user => ({
              ...user,
              answer_number: 0
            }))

            // 애니메이션 매니저가 준비될 때까지 대기
            await waitForAnimationManager()
            
            // 모든 사용자를 원래 위치로 이동
            const animationManager = (window as any).userAnimationManager
            if (animationManager && animationManager.isReady()) {
              processedUsers.forEach((user, index) => {
                animationManager.moveSingleUserToOriginal(processedUsers, index)
              })
            }
          }
        }
      )

      // AdminRoom과 같은 사용자 상태 관리
      stateCb(room!.state).users.onAdd((user) => {
        // 기존 users에서 username이 일치하는 사용자 찾기
        const existingUser = processedUsers.find(
          (u) => u.username === user.username
        )
        if (existingUser) {
          userVariants = { ...userVariants, [user.username]: 'primary' }
        }
      })

      stateCb(room!.state).users.onRemove((user) => {
        userVariants = { ...userVariants, [user.username]: 'gray' }
      })

      room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
        // 상태 변경 처리
      })

      isConnecting = false
    } catch (error) {
      console.error('연결 실패:', error)
      connectionError =
        error instanceof Error ? error.message : '연결에 실패했습니다.'
      isConnecting = false

      // seat reservation expired 오류인 경우 재시도
      if (
        error instanceof Error &&
        error.message.includes('seat reservation expired')
      ) {
        setTimeout(() => {
          if (isConnecting === false) {
            initializeRoom()
          }
        }, 3000)
      }
    }
  }

  // SvelteKit 라우팅 변경 감지 (뒤로가기, 앞으로가기 등)
  let previousPath = ''
  $effect(() => {
    if (
      previousPath.startsWith('/quizz/') &&
      !page.url.pathname.startsWith('/quizz/')
    ) {
      cleanupRoom()
    }
    previousPath = page.url.pathname
  })

  onMount(() => {
    // 브라우저를 떠날 때 정리 작업 (새로고침, 탭 닫기 등)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      cleanupRoom()
      event.preventDefault()
    }

    // 페이지 숨김/보임 이벤트 (모바일에서 뒤로가기 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 페이지가 숨겨질 때 정리 작업
        cleanupRoom()
        isConnecting = false
      } else if (document.visibilityState === 'visible') {
        // 페이지가 다시 보여질 때 재연결
        initializeRoom()
      }
    }

    // 페이지 언로드 이벤트
    const handleUnload = () => {
      cleanupRoom()
    }

    // 페이지 숨김 이벤트 (추가)
    const handlePageHide = () => {
      cleanupRoom()
    }

    // 브라우저 뒤로가기/앞으로가기 이벤트
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/quizz/')) {
        cleanupRoom()
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('unload', handleUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)

    // 초기 연결
    initializeRoom()

    // 컴포넌트 변경 애니메이션 (간단한 버전)
    $effect(() => {
      if (correctNumber !== previousCorrectNumber) {
        // 0에서 0이 아닌 값으로 바뀔 때만 애니메이션 적용
        if (previousCorrectNumber === 0 && correctNumber !== 0) {
          const currentComponent = document.querySelector(
            '.component-container'
          )
          if (currentComponent) {
            // 현재 컴포넌트 즉시 사라짐
            gsap.set(currentComponent, {
              opacity: 0,
              scale: 0.1,
            })

            // 새 컴포넌트 나타나는 애니메이션
            setTimeout(() => {
              const newComponent = document.querySelector(
                '.component-container'
              )
              if (newComponent) {
                gsap.fromTo(
                  newComponent,
                  { opacity: 0, scale: 0.1 },
                  {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power2.out',
                  }
                )
              }
            }, 50)
          }
        }
        // 0이 아닌 값에서 0으로 바뀔 때는 즉시 변경 (애니메이션 없음)
      }
    })

    // onDestroy에서 이벤트 리스너 제거
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
      <div
        class="animate-spin rounded-full h-16 w-16 border-4 border-blue-800 mx-auto mb-6"
      ></div>
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
          onNumberClick={async (number) => {
            // 현재 사용자의 answer_number 업데이트
            if (currentUserAnswerNumber === number) {
              // 같은 숫자를 다시 클릭하면 원위치로
              currentUserAnswerNumber = 0
              room?.send('number_clicked', 0)
            } else {
              // 새로운 숫자 클릭
              currentUserAnswerNumber = number
              room?.send('number_clicked', number)
            }
            
            // processedUsers에서 현재 사용자의 answer_number 업데이트
            const currentUserIndex = processedUsers.findIndex(u => u.username === '나')
            if (currentUserIndex !== -1) {
              processedUsers = processedUsers.map((user, index) => 
                index === currentUserIndex 
                  ? { ...user, answer_number: currentUserAnswerNumber }
                  : user
              )
            }

            // 애니메이션 매니저가 준비될 때까지 대기
            await waitForAnimationManager()
            
            // 애니메이션 실행
            const animationManager = (window as any).userAnimationManager
            if (animationManager && animationManager.isReady()) {
              if (currentUserAnswerNumber > 0 && currentUserAnswerNumber <= 4) {
                animationManager.moveSingleUserToNumber(processedUsers, currentUserIndex, currentUserAnswerNumber)
              } else if (currentUserAnswerNumber === 0) {
                animationManager.moveSingleUserToOriginal(processedUsers, currentUserIndex)
              }
            }
          }}
        />
      </div>
    {/if}
  </div>

  <!-- 대기화면 모달 -->
  {#if correctNumber === 0}
    <div class="modal-overlay">
      <div class="modal-content">
        <WaitingAnimation />
      </div>
    </div>
  {/if}
{/if}

<style>
  .kids-room-container {
    border-radius: 15px;
    padding: 10px;
    margin: 10px;
    height: calc(100vh - 120px);
    background-color: #0e1218;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
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
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background-color: #1f2937;
    border-radius: 10px;
    padding: 3rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
</style>
