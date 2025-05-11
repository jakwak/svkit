<script lang="ts">
  import { onMount } from "svelte"

	let userId = "8";
	let messages: string[] = [];

	let es: EventSource;

	function connect() {
		es = new EventSource(`/api/sse/${userId}`);

		es.addEventListener("message", (e) => {
      console.log("message", JSON.parse(e.data));
			messages = [...messages, e.data];
		});

		es.addEventListener("ping", () => {
			console.log("keep-alive");
		});

		es.onerror = (e) => {
			console.error("SSE error", e);
			es.close();
		};
	}

  const testObj = {
    name: "test",
    age: 123,
  }

	async function sendMessage() {
		const res = await fetch(`/api/broadcast`, {
			method: "POST",
			body: JSON.stringify({obj: testObj, msg: 'Test msg', time: new Date().toLocaleTimeString() }),
		});
    console.log("res", await res.json());
	}

	onMount(() => {
		connect();
	});
</script>

<h1>EventSourceResponse - 사용자별 알림</h1>
<button onclick={sendMessage} type="button" class="btn-info">내게 메시지 보내기</button>

<ul>
	{#each messages as msg}
		<li>{msg}</li>
	{/each}
</ul>