<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { Room, Client, getStateCallbacks } from 'colyseus.js'
  import type { MyState } from '$lib/MyState'
  import { ADMIN_NAME, appStore, USER_CONSTANTS } from '$lib'
  import NumberButtons from './NumberButtons.svelte'
  import UserButtons from './UserButtons.svelte'

  const { users: initialUsers } = $props<{ users: User[] }>()

  let room: Room<MyState> | null = $state(null)
  let client: Client
  let users = $state([
    ...initialUsers
      .filter((user: User) => user.username !== ADMIN_NAME)
                    .map((user: User) => ({
                ...user,
                variant: USER_CONSTANTS.DEFAULT_VARIANT,
              })),
  ])

  // 사용자별 variant를 별도로 관리
  let userVariants = $state<Record<string, string>>({})

  onMount(async () => {
    await connectToServer()
  })

  async function connectToServer() {
    const gameServerUrl = import.meta.env.DEV
      ? 'ws://localhost:2568'
      : import.meta.env.VITE_GAME_SERVER || 'wss://gxg.kro.kr/game-server/'

    client = new Client(gameServerUrl)

    room = await client.joinOrCreate<MyState>('q_room', {
      username: appStore.username,
    })

    // room!.onStateChange((state) => {
    //   console.log('correct_number 1--->', state.correct_number)
    // })

    const stateCb = getStateCallbacks(room!)

    stateCb(room!.state).listen(
      'correct_number',
      (correct_number, previous_correct_number) => {
        console.log(
          'Listen correct_number--->',
          correct_number,
          previous_correct_number
        )
      }
    )

    stateCb(room!.state).users.onAdd((user) => {
      // 기존 users에서 username이 일치하는 사용자 찾기
      const existingUser = users.find((u) => u.username === user.username)
      if (existingUser) {
        userVariants = { ...userVariants, [user.username]: 'primary' }
      }
    })
    stateCb(room!.state).users.onRemove((user) => {
      userVariants = { ...userVariants, [user.username]: 'gray' }
    })

    room!.onMessage('__playground_message_types', (message) => {
      // 메시지 처리
    })
    room!.onMessage('error', (message) => {
      // 에러 처리
    })
    room!.onStateChange(({ correct_number, teacher_ready, all_ready }) => {
      // 상태 변경 처리
    })
  }

  onDestroy(() => {
    room?.leave()
    users = []
  })
</script>

{#if room}
  <div class="admin-room-container">
    <div class="user-buttons-section">
      <UserButtons {users} {userVariants} />
    </div>
    
    <div class="number-buttons-section">
      <NumberButtons
        onNumberClick={(number) => {
          room?.send('correct_number', { correct_number: number })
        }}
      />
    </div>
  </div>
{:else}
  <div class="loading-container">
    <div class="loading loading-spinner loading-lg"></div>
    <p class="mt-4">서버에 접속 중...</p>
  </div>
{/if}

<style>
  .admin-room-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .user-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .number-buttons-section {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }
</style>
