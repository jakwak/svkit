import { io, type Socket } from 'socket.io-client'
import {
  ADMIN_NAME,
  GUEST_USER,
  type SessionState,
  supabase,
} from '$lib'
import { dev } from '$app/environment'
import { goto } from '$app/navigation'

// const isDev = import.meta.env.MODE === 'development';

class AppStore {
  cur_user = $state({}) as User
  online_users = $state([]) as string[]
  quiz = $state(null) as QuizQuestion | null
  socket = $state(null) as Socket | null

  // 세션 상태 관리
  sessionState = $state<SessionState>('idle')

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
    if (this.socket) this.socket.disconnect()

    this.cur_user = user
    
    // 사용자 정보는 쿠키로만 관리
    if (user.username !== GUEST_USER) {
      console.log('✅ 사용자 연결:', user.username)
    }
    
    this.socket = io(
      dev
        ? import.meta.env.VITE_API_URL || 'http://localhost:8000'
        : 'https://gxg.kro.kr',
      {
        path: '/ws2/socket.io', // socketio_path 설정과 맞춰줘야 함
        transports: ['websocket'], // polling 문제 방지
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
    
    // 쿠키 삭제
    document.cookie = 'supabase-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    
    // Supabase 세션도 함께 종료하고 완료 후 페이지 이동
    await supabase.auth.signOut()
    goto('/')
  }
}

export const appStore = new AppStore()
