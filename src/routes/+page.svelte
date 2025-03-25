<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, wsStore } from '$lib'
  


	onMount(() => {
		if (appState.username !== "Guest")
			wsStore.connect()
	})

	onDestroy(() => {
		wsStore.close()
	})
</script>

<h1 class="text-3xl"> Home </h1>
<h1 class="text-xl text-blue-500">{wsStore.open ? "Connected" : "Disconnected"}</h1>


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
