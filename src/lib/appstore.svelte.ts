import { io, type Socket } from 'socket.io-client'
import { ADMIN_NAME, GUEST_USER, type SessionState, supabase } from '$lib'
import { dev } from '$app/environment'
import { goto } from '$app/navigation'

// const isDev = import.meta.env.MODE === 'development';

class AppStore {
  cur_user = $state({}) as User
  online_users = $state([]) as string[]
  quiz = $state(null) as QuizQuestion | null
  socket = $state(null) as Socket | null
  lastConnectedUser = $state<string | null>(null) // 중복 연결 방지

  // 세션 상태 관리
  sessionState = $state<SessionState>('idle')

  // 뒤로가기 감지용 상태
  isAutoLoggedIn = $state(false)
  autoLoginPath = $state<string | null>(null)

  get isAuthenticated() {
    return this.username !== GUEST_USER
  }
  get isAdmin() {
    return this.username === ADMIN_NAME
  }

  get username() {
    return this.cur_user.username
  }

  get id() {
    return this.cur_user.id
  }

  get score() {
    return this.cur_user.score
  }

  isOnline(username: string) {
    return this.online_users.some((user) => user === username)
  }

  connect(user: User) {
    // 같은 사용자로 중복 연결 방지 (자동 로그인 시에는 허용)
    if (
      this.lastConnectedUser === user.username &&
      user.username !== GUEST_USER
    ) {
      console.log('🔄 이미 연결된 사용자:', user.username)
      return
    }

    // 기존 연결 정리
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.cur_user = user
    this.lastConnectedUser = user.username

    // 자동 로그인 상태 확인 및 설정
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/quizz/') && user.username !== GUEST_USER) {
      this.isAutoLoggedIn = true
      this.autoLoginPath = currentPath
      console.log('🔍 자동 로그인 상태 설정:', {
        username: user.username,
        path: currentPath,
      })

      // 자동 로그인 상태를 세션스토리지에 저장 (페이지 새로고침 시에도 유지)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'autoLoginState',
          JSON.stringify({
            username: user.username,
            path: currentPath,
            timestamp: Date.now(),
          })
        )
      }
    }

    // 사용자 정보는 쿠키로만 관리
    if (user.username !== GUEST_USER) {
      console.log('✅ 사용자 연결:', user.username)
    }

    // Socket.IO 연결 (최적화된 설정)
    this.socket = io(
      dev
        ? import.meta.env.VITE_API_URL || 'http://localhost:8000'
        : 'https://gxg.kro.kr',
      {
        path: '/ws2/socket.io',
        transports: ['websocket'],
        timeout: 10000, // 10초 타임아웃
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      }
    )

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO Connected for user:', user.username)
      this.socket?.emit('join', { username: user.username })
    })

    this.socket.on('users', (data) => {
      this.online_users = data.users
      console.log('👥 users:', data.users)
    })

    // this.socket.on('message', (data) => {
    //   console.log('📥 message received:', data);
    // });

    this.socket.on('quiz', (data) => {
      this.quiz = JSON.parse(data.quiz)
    })

    this.socket.on('answer', (data) => {
      console.log('new_answer: ', data)
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO Disconnected')
    })

    if (this.isAdmin === false) {
      // class_start 메시지 받기
      this.socket.on('class_start', (data) => {
        console.log('수업 시작 메시지 받음:', data)
        this.startSession()
      })

      // class_end 메시지 받기
      this.socket.on('class_end', (data) => {
        console.log('수업 종료 메시지 받음:', data)
        this.endSession()
      })
    }
  }

  sendMessage(msg: Message) {
    if (this.socket) {
      this.socket.emit('message', msg)
    }
  }

  sendQuiz(quiz: QuizQuestion) {
    if (this.socket) {
      this.socket.emit('quiz', { quiz: JSON.stringify(quiz) })
    }
  }

  // 수업시작 메시지 보내기
  sendClassStart() {
    if (this.socket) {
      this.socket.emit('class_start', {
        username: this.username,
        message: '수업이 시작되었습니다.',
      })
      // this.startSession() // 수업 상태 업데이트
      this.sessionState = 'waiting'
    }
  }
  // 수업종료 메시지 보내기
  sendClassEnd() {
    if (this.socket) {
      this.socket.emit('class_end', {
        username: this.username,
        message: '수업이 종료되었습니다.',
      })
      this.endSession() // 수업 상태 업데이트
    }
  }

  // 세션 상태 변경 함수들
  startSession() {
    this.sessionState = 'start'
  }

  startGame() {
    this.sessionState = 'game'
  }

  showQuiz() {
    this.sessionState = 'quiz'
  }

  showResult() {
    this.sessionState = 'result'
  }

  endSession() {
    this.sessionState = 'end'
  }

  async logout() {
    if (!this.isAuthenticated) return
    // 소켓 연결 해제 등 기존 로직
    if (this.socket) this.socket.disconnect()
    this.cur_user = { username: GUEST_USER, id: '0' }
    this.online_users = []
    this.quiz = null

    // 자동 로그인 상태 초기화
    this.isAutoLoggedIn = false
    this.autoLoginPath = null

    // 세션스토리지에서 자동 로그인 상태 제거
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('autoLoginState')
    }

    // 쿠키 삭제
    document.cookie =
      'supabase-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'

    // Supabase 세션도 함께 종료하고 완료 후 페이지 이동
    await supabase.auth.signOut()
    goto('/')
  }

  // 자동 로그인 상태 복원
  restoreAutoLoginState() {
    if (typeof window === 'undefined') return

    try {
      const autoLoginState = sessionStorage.getItem('autoLoginState')
      if (autoLoginState) {
        const state = JSON.parse(autoLoginState)
        const currentPath = window.location.pathname

        // 현재 경로와 저장된 경로가 일치하는 경우에만 복원
        if (state.path === currentPath && state.username) {
          this.isAutoLoggedIn = true
          this.autoLoginPath = currentPath
          console.log('🔄 자동 로그인 상태 복원:', state.username)
        }
      }
    } catch (error) {
      console.error('자동 로그인 상태 복원 실패:', error)
    }
  }

  // 뒤로가기 이벤트 감지 및 자동 로그아웃 처리
  setupBackButtonHandler() {
    if (typeof window === 'undefined') return

    // 자동 로그인 상태에서 히스토리 엔트리 추가
    if (this.isAutoLoggedIn && this.autoLoginPath) {
      // 현재 페이지를 히스토리에 추가하여 뒤로가기 감지 가능하게 함
      window.history.pushState({ autoLogin: true }, '', this.autoLoginPath)
      console.log('📝 자동 로그인 히스토리 엔트리 추가')
    }

    const handleBeforeUnload = () => {
      if (this.isAutoLoggedIn) {
        console.log('🔙 페이지 언로드 감지, 자동 로그아웃 실행')
        this.logout()
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (this.isAutoLoggedIn) {
        console.log('🔙 브라우저 뒤로가기 감지, 자동 로그아웃 실행')
        // 뒤로가기 시 즉시 로그아웃
        this.logout()
        return
      }
    }

    // 페이지 언로드 시 처리
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 브라우저 뒤로가기/앞으로가기 버튼 감지
    window.addEventListener('popstate', handlePopState)

    // 클린업 함수 반환
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }
}

export const appStore = new AppStore()
