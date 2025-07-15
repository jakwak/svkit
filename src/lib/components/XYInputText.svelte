<script lang="ts">
  import { appStore } from '$lib'
  import { tick } from 'svelte'

  interface Input {
    id: number
    x: number
    y: number
    text: string
    isEditing?: boolean
    username: string
  }

  let inputs = $state<Input[]>([])
  let container: HTMLDivElement

  // 드래그 상태를 추적하는 변수
  let dragging: {
    id: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null = null

  let mouseDown = false

  async function handleClick(event: MouseEvent) {
    if (mouseDown) return

    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left + container.scrollLeft
    const y = event.clientY - rect.top + container.scrollTop

    // Remove inputs with empty text and not in editing mode
    inputs = inputs.filter(input => input.isEditing || input.text !== '')

    const id = Date.now()
    inputs.push({ id, x, y, text: '', isEditing: true, username: appStore.username })

    await tick()
    const inputEl = document.getElementById(`input-${id}`) as HTMLInputElement
    inputEl?.focus()
  }

  function handleKeyDown(id: number, e: KeyboardEvent) {
    const input = inputs.find((input) => input.id === id)
    if (e.key === 'Enter') {
      if (input) {
        const text = (e.target as HTMLInputElement).value.trim()
        
        if (text === '') {
          inputs = inputs.filter((i) => i.id !== input.id)
          appStore.sendMessage({message: "delete", payload: {id}})
        } else {
          input.text = text
          input.isEditing = false
          appStore.sendMessage({message: "input", payload: input})
        }
      }
      
      // 포커스를 제거하여 blur 이벤트가 발생하지 않도록 함
      (e.target as HTMLInputElement).blur()
      
      // 이벤트 기본 동작 방지
      e.preventDefault()
      e.stopPropagation()
    } else if (e.key === 'Escape') {
      if (input) {
        inputs = inputs.filter((i) => i.id !== input.id)
        appStore.sendMessage({message: "delete", payload: {id}})
      }
    }
  }

  function handleBlur(id: number, text: string) {
    const input = inputs.find((input) => input.id === id)
    if (!input || !input.isEditing) return;

    if (text.trim() === '') {
      inputs = inputs.filter((input) => input.id !== id)
    } else {
      const input = inputs.find((input) => input.id === id)
      if (input) {
        input.text = text.trim()
        input.isEditing = false
        appStore.sendMessage({message: "input", payload: input})
      }
    }
  }

  function startEditing(id: number) {
    const input = inputs.find((input) => input.id === id)
    if (input) {
      input.isEditing = true
      tick().then(() => {
        const inputEl = document.getElementById(
          `input-${id}`
        ) as HTMLInputElement
        inputEl?.focus()
      })
    }
  }

  let wasDragged = $state(false)

  // 드래그 시작
  function handleMouseDown(event: MouseEvent, id: number) {
    mouseDown = true
    wasDragged = false // 드래그 시작 시 초기화
    const input = inputs.find((input) => input.id === id)

    if (input?.username !== appStore.username)
      return

    if (input) {
      dragging = {
        id,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: input.x,
        offsetY: input.y,
      }
      event.stopPropagation() // 클릭 전파 방지
    }
  }

  let lastSentAt = 0;

  function handleMouseMove(event: MouseEvent) {
    if (dragging) {
      const dx = event.clientX - dragging.startX
      const dy = event.clientY - dragging.startY

      // 일정 거리 이상 움직였을 때만 드래그로 간주
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        wasDragged = true
      }

      // 드래그 중에 x, y 위치 업데이트
      const input = inputs.find((input) => input.id === dragging?.id)
      if (input) {
        input.x = dragging.offsetX + dx
        input.y = dragging.offsetY + dy
        
        const now = Date.now();
        if (now - lastSentAt > 100) {  // 100ms마다만 보내기
          lastSentAt = now;
          appStore.sendMessage({ message: "input", payload: input });
        }
      }
    }
  }
  // 드래그 종료
  function handleMouseUp(event: MouseEvent) {
    const wasDraggingId = dragging?.id
    dragging = null
    setTimeout(() => {
      mouseDown = false
      // 드래그 후 클릭 이벤트 처리
      if (!wasDragged && wasDraggingId) {
        const input = inputs.find(input => input.id === wasDraggingId)
        if (input && !input.isEditing) {
          startEditing(wasDraggingId)
        }
      }
      wasDragged = false
    }, 0)
  }

  // 드래그 이벤트 리스너 등록
  import { onMount } from 'svelte'
  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    appStore.socket?.on('message', (data) => {
      const input = data.payload
      inputs = inputs.filter((i) => i.id !== input.id)
      if (data.message === 'input') {
        inputs.push(input)
      }
    })

    appStore.socket?.on('users', (data) => {
      if (data.message === 'Connected' && appStore.isAdmin) {
        appStore.socket?.emit('send_to_user', {to: data.sender, message: 'inputs', payload: inputs})
      }
    })

    appStore.socket?.on('direct_message', (data) => {
      if  (data.message === 'inputs') 
        inputs = data.payload
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  })
</script>


<div
  bind:this={container}
  class="relative w-full h-[calc(100vh-200px)] bg-zinc-900 overflow-auto"  role="presentation"  onclick={handleClick}
>
  {#each inputs as input (input.id)}
    {#if input.text === '' || input.isEditing}
      <input
        id={`input-${input.id}`}
        class="absolute"
        style="top: {input.y}px; left: {input.x}px"
        value={input.text}
        onkeydown={(e) => handleKeyDown(input.id, e)}
        onblur={(e) =>
          handleBlur(input.id, (e.target as HTMLInputElement).value)}
        onclick={(e) => e.stopPropagation()}
      />
    {:else}
      <button
        type="button"
        class="absolute p-1 cursor-pointer"
        style="top: {input.y}px; left: {input.x}px"
        onmousedown={(e) => handleMouseDown(e, input.id)}
        onclick={(e) => {e.stopPropagation()}}
      >
        {@html input.text} 
        {#if input.username !== appStore.username}
          <span class="text-xs text-gray-500">- @{input.username}</span>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style>
  input {
    width: 200px;
    border: none;
    border-bottom: 2px solid #069745;
    background: transparent;
    outline: none;
    padding: 2px 0;
  }
  button {
    cursor: grab;
  }
</style>
