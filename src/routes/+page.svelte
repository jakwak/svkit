<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	  import { appState } from '$lib/app_state.svelte'
  
		let socket: WebSocket
	let status = $state("Disconnected");

	let cur_user = appState.username

	onMount(() => {
		socket = new WebSocket('ws://localhost:8000/ws/' + cur_user)

		socket.onopen = () => {
			status = "Connected"
		}
		
		socket.onmessage = (event) => {
			status = event.data
		}

		socket.onclose = () => {
			status = "Disconnected"
		}
	})

	onDestroy(() => {
		if (socket) {
			socket.close()
		}
	})
</script>

<h1 class="text-2xl text-blue-500">{status}</h1>


<!-- <script>
  import { wsStore } from "$lib/websocket.ts";

  // 웹소켓 연결
  wsStore.connect();

  let newMessage = "";
</script>

<h2>💬 WebSocket Chat</h2>

<div class="chat-box">
  {#each wsStore.messages as msg}
    <p>{msg}</p>
  {/each}
</div>

<input bind:value={newMessage} placeholder="Type a message..." />
<button on:click={() => { wsStore.sendMessage(newMessage); newMessage = ""; }}>Send</button>

<style>
  .chat-box { 
    border: 1px solid #ddd; 
    padding: 10px; 
    height: 200px; 
    overflow-y: auto; 
    margin-bottom: 10px; 
  }
</style> -->
