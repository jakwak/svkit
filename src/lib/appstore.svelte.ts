import { io, type Socket } from 'socket.io-client';
import { AdminUser, Guest } from './globals'

const isDev = import.meta.env.MODE === 'development';

class AppStore {
  cur_user = $state({username: Guest}) as User;
  users = $state([]) as string[];
  quiz = $state(null) as QuizQuestion | null;
  socket = $state(null) as Socket | null;

  get isAuthenticated() {
    return this.username !== Guest;
  }
  get isAdmin() {
    return this.username === AdminUser
  }

  get username() {
    return this.cur_user.username;
  }

  get score() {
    return this.cur_user.score;
  }
  
  connect(user: User) {
    this.cur_user = user;

    this.socket = io(isDev ? "http://localhost:8000" : "https://gxg.kro.kr", {
      path: "/ws2/socket.io", // socketio_path 설정과 맞춰줘야 함
      transports: ['websocket'], // polling 문제 방지
    });

    this.socket.on('connect', () => {
      console.log("✅ Socket.IO Connected");
      this.socket?.emit("join", { username: user.username });
    });

    this.socket.on('users', (data) => {
      this.users = data.users;
      console.log('👥 users:', data.users);
    });

    // this.socket.on('message', (data) => {
    //   console.log('📥 message received:', data);      
    // });    

    this.socket.on('quiz', (data) => {
      this.quiz = JSON.parse(data.quiz);
    });

    this.socket.on('answer', (data) => {
      console.log('new_answer: ', data);
    });
    
    this.socket.on('disconnect', () => {
      console.log("❌ Socket.IO Disconnected");
    });
  }

  sendMessage(msg: Message) {
    if (this.socket) {
      this.socket.emit("message", msg);
    }
  }

  sendQuiz(quiz: QuizQuestion) {
    if (this.socket) {
      this.socket.emit("quiz", {quiz: JSON.stringify(quiz)});
    }
  }

  
  async logout() {
    if(!this.isAuthenticated) return    
    this.cur_user = {username: Guest, id: '0'};
    this.users = [];
    if(this.socket) this.socket.disconnect();
    await fetch("/api/logout", { method: "POST" });        
  }
  
}

export const appStore = new AppStore();
