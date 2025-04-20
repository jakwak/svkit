import { io, type Socket } from 'socket.io-client';
import { Guest } from './globals'

class AppStore {
  cur_user = $state({username: 'Guest'}) as User;
  users = $state([]) as string[];
  quiz = $state(null) as QuizQuestion | null;
  socket = $state(null) as Socket | null;

  get isAuthenticated() {
    return this.cur_user.username !== 'Guest';
  }
  get isAdmin() {
    return this.cur_user.username === '선생님'
  }

  get username() {
    return this.cur_user.username;
  }
  
  connect(user: User) {
    this.cur_user = user;

    this.socket = io("http://localhost:8000", {
      path: "/ws2/socket.io", // socketio_path 설정과 맞춰줘야 함
      transports: ['websocket'], // polling 문제 방지
    });

    this.socket.on('connect', () => {
      console.log("✅ Socket.IO Connected");
      this.socket?.emit("join", { username: user.username });
    });

    this.socket.on('message', (data) => {
      console.log('📥 received:', data);
      if (data.users) this.users = data.users;
    });

    this.socket.on('quiz', (data) => {
      this.quiz = JSON.parse(data.quiz);
    });

    this.socket.on('disconnect', () => {
      console.log("❌ Socket.IO Disconnected");
    });
  }

  sendMessage(message: Message) {
    if (this.socket) {
      this.socket.emit("send_message", message);
    }
  }

  sendQuiz(quiz: QuizQuestion) {
    if (this.socket) {
      this.socket.emit("quiz", {quiz: JSON.stringify(quiz)});
    }
  }

  
  async logout() {
    if(!this.isAuthenticated) return    
    this.cur_user = {username: Guest};
    this.users = [];
    if(this.socket) this.socket.disconnect();
    await fetch("/api/logout", { method: "POST" });    
  }
  
}

export const appStore = new AppStore();
