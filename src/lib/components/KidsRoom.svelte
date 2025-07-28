<script lang="ts">
  import { onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { WaitingScreen } from '$lib'
  import { page } from '$app/state'

  let { username }: { username: string } = $props()

  console.log('username--->', username)
  let room: Room<MyState> | null = $state(null)
  let client: Client
  let isConnecting = $state(true)
  let connectionError = $state<string | null>(null)
  // let users: User[] = $state([])

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
        console.log('__playground_message_types--->', message)
      })

      const stateCb = getStateCallbacks(room!)

      stateCb(room!.state).listen(
        'correct_number',
        (correct_number, previous_correct_number) => {
          console.log(
            'correct_number--->',
            correct_number,
            previous_correct_number
          )
        }
      )

      room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
        console.log(
          'onStateChange--->',
          correct_number,
          teacher_ready,
          all_ready
        )
      })

      isConnecting = false
      console.log('연결 완료!')
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
        console.log('좌석 예약 만료 - 3초 후 재시도')
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
        console.log('페이지가 다시 보여짐 - 재연결 시도')
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
  <WaitingScreen />
{/if}
