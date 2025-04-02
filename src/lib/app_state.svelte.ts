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

  async logout() {
    this.username = "Guest";
    this.isLoggedIn = false;
    await fetch("/api/logout", { method: "POST" });
  }
}

export const appState = new AppState();

type Message = {
  sender: string;
  message: string;
};


class WebSocketStore {
  users = $state() as string[];
  socket: WebSocket | null = null;
  open = $state() as boolean;
  
  constructor() {
    this.open = false;
    this.users = [];
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:8000/ws/" + appState.username);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);      
      if(data.users) this.users = data.users
      
      console.log(data);      
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

  sendMessage(message: Message) {    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close(1000, "Normal Closure");
    }
  }
}

export const wsStore = new WebSocketStore();
