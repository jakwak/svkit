<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();

	let socket: WebSocket
	let status = $state("Disconnected");

	let cur_user = data.cur_user ? data.cur_user : "Guest";

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

<h1>Home ===> {data.cur_user}</h1>
<p>data: {JSON.stringify(data)}</p>

<h1 class="text-2xl text-blue-500">{status}</h1>