<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { appStore } from '$lib'
  import NumberButtons from './NumberButtons.svelte'

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let users: User[] = $state([])

  onMount(async () => {
    // 개발 환경에서는 localhost, 프로덕션에서는 환경변수 사용
    const gameServerUrl = import.meta.env.DEV 
      ? 'ws://localhost:2568' 
      : (import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/')
    
    client = new Client(gameServerUrl)
    room = await client.joinOrCreate<MyState>('q_room', {
      username: appStore.username,
    })

    const stateCb = getStateCallbacks(room)

    // $(room.state).listen("users", (currentValue, previousValue) => {
    //   console.log('users--->', currentValue, previousValue)
    //   console.log(room.state.users)
    // })

    stateCb(room.state).users.onAdd((user) => {
      console.log('on_add users--->', user)
      users = [...users, { username: user.username, id: appStore.id || 'none' }]
    })
    stateCb(room.state).users.onRemove((user) => {
      console.log('on_remove users--->', user)
      users = users.filter((u) => u.username !== user.username)
    })

    room.onMessage('__playground_message_types', (message) => {
      console.log('__playground_message_types--->', message)
    })
    room.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
      console.log(
        'onStateChange --->',
        correct_number,
        teacher_ready,
        all_ready
      )
    })
  })

  onDestroy(() => {
    console.log('onDestroy--->')
    room?.leave()
  })
</script>

{#if room}
  <div>AdminRoom- {room.sessionId}</div>
  <NumberButtons
    onNumberClick={(number) => {
      console.log('number--->', number)
    }}
  />
{:else}
  <div>서버에 접속 중...</div>
{/if}
