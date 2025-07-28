<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { appStore, WaitingScreen } from '$lib'

  let { username }: { username: string } = $props()

  console.log('username--->', username)
  let room: Room<MyState> | null = $state(null)
  let client: Client
  // let users: User[] = $state([])

  onMount(async () => {
    // 개발 환경에서는 localhost, 프로덕션에서는 환경변수 사용
    const gameServerUrl = import.meta.env.DEV 
      ? 'ws://localhost:2568' 
      : (import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/')
    
    client = new Client(gameServerUrl)
    
    room = await client.joinOrCreate<MyState>('q_room', {
      username: username,
    })

    room.onMessage('__playground_message_types', (message) => {
      console.log('__playground_message_types--->', message)
    })

    const stateCb = getStateCallbacks(room!)

    stateCb(room!.state).listen('correct_number', (correct_number, previous_correct_number) => {
      console.log('correct_number--->', correct_number, previous_correct_number)
    })

    room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
      console.log('onStateChange--->', correct_number, teacher_ready, all_ready)
    })
  })

  onDestroy(() => {
    room?.leave()
  })
</script>

<WaitingScreen />