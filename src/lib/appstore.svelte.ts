import { io, type Socket } from 'socket.io-client'
import { AdminUser, Guest } from './globals'
import { dev } from '$app/environment'

// const isDev = import.meta.env.MODE === 'development';

class AppStore {
  cur_user = $state({ username: Guest }) as User
  users = $state([]) as string[]
  quiz = $state(null) as QuizQuestion | null
  socket = $state(null) as Socket | null
  classInSession = $state(false) // 수업 진행 상태 추가
  get isAuthenticated() {
    return this.username !== Guest
  }
  get isAdmin() {
    return this.username === AdminUser
  }

  get username() {
    return this.cur_user.username
  }

  get score() {
    return this.cur_user.score
  }

  connect(user: User) {
    if (this.socket) this.socket.disconnect()

    this.cur_user = user
    this.socket = io(dev ? 'http://localhost:8000' : 'https://gxg.kro.kr', {
      path: '/ws2/socket.io', // socketio_path 설정과 맞춰줘야 함
      transports: ['websocket'], // polling 문제 방지
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO Connected')
      this.socket?.emit('join', { username: user.username })
    })

    this.socket.on('users', (data) => {
      this.users = data.users
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

    // class_start 메시지 받기
    this.socket.on('class_start', (data) => {
      console.log('수업 시작 메시지 받음:', data)
      this.classInSession = true
    })

    // class_end 메시지 받기
    this.socket.on('class_end', (data) => {
      console.log('수업 종료 메시지 받음:', data)
      this.classInSession = false
    })
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
      this.classInSession = true // 수업 상태 업데이트
    }
  }
  // 수업종료 메시지 보내기
  sendClassEnd() {
    if (this.socket) {
      this.socket.emit('class_end', {
        username: this.username,
        message: '수업이 종료되었습니다.',
      })
      this.classInSession = false // 수업 상태 업데이트
    }
  }

  async logout() {
    if (!this.isAuthenticated) return
    this.users = []
    this.connect({ username: Guest, id: '0' })
    await fetch('/api/logout', { method: 'POST' })
  }
}

export const appStore = new AppStore()
