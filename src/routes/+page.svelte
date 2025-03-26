<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import { appState, wsStore } from '$lib'
  import type { PageProps } from './$types'
  import { goto } from '$app/navigation'
  
  let { data }: PageProps = $props()

	onMount(() => {
		if (appState.username !== "Guest")
			wsStore.connect()
	})

	onDestroy(() => {
		wsStore.close()
	})
</script>

<svelte:head>
	<title>Users List</title>
</svelte:head>

<h1 class="text-3xl"> Home </h1>
<h1 class="text-xl text-blue-500">{wsStore.open ? "Connected" : "Disconnected"}</h1>

<div class="flex items-center justify-center max-w-2xl mx-auto">
  <div class="container mx-auto">    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {#each [...data.users].sort((a, b) => a.username.localeCompare(b.username)) as user}
        <button class="btn" class:btn-primary={wsStore.users.some(wsUser => wsUser === user.username)} >
          {user.username}
        </button>
      {/each}
    </div>
  </div>
</div>

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
