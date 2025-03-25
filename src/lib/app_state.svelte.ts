class AppState {
  username = $state() as string;
  isLoggedIn = $state() as boolean;

  constructor() {
    this.username = "Guest";
    this.isLoggedIn = false;
  }

  login(name: string) {
    this.username = name;
    this.isLoggedIn = true;
  }

  logout() {
    this.username = "Guest";
    this.isLoggedIn = false;
  }
}

export const appState = new AppState();

class WebSocketStore {
  messages = $state() as string[];
  socket: WebSocket | null = null;
  open = $state() as boolean;
  
  constructor() {
    this.messages = [];
    this.open = false;
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:8000/ws/" + appState.username);
    
    this.socket.onmessage = (event) => {
      this.messages = [...this.messages, event.data];  // 새로운 메시지를 배열에 추가
    };

    this.socket.onopen = () => {
      this.open = true;
      console.log("✅ WebSocket Connected");
    };

    this.socket.onclose = () => {
      this.open = false;
      console.log("❌ WebSocket Disconnected");
    };
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const wsStore = new WebSocketStore();