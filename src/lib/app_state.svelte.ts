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

type Message = {
  sender: string;
  message: string;
};


class WebSocketStore {
  messages = $state() as Message[];
  socket: WebSocket | null = null;
  open = $state() as boolean;
  users = $state(new Set()) as Set<string>;
  
  constructor() {
    this.open = false;
    this.messages = [];
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:8000/ws/" + appState.username);
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);      
      this.messages = [...this.messages, event.data as Message];  // 새로운 메시지를 배열에 추가
      
      if (data.message === "Connected") {
        this.users.add(data.sender);   
        console.log("users: ", $state.snapshot(this.users));           
      } else if (data.message === "Disconnected") {
        this.users.delete(data.sender);            
        console.log("users: ", this.users);
      }
      console.log("messages:", $state.snapshot(this.messages));
      
    };

    this.socket.onopen = () => {
      this.open = true;      
      this.sendMessage({sender: appState.username, message: "Connected"});
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
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const wsStore = new WebSocketStore();
