<script lang="ts">
  interface TextElement {
    id: string
    text: string
    x: number
    y: number
  }

  const { onTextAdd } = $props<{
    onTextAdd: (textElement: TextElement) => void
  }>()

  let isInputMode = $state(false)
  let inputText = $state('')
  let inputPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 })
  let inputElement = $state<HTMLInputElement | null>(null)
  let textElements = $state<Array<TextElement>>([])
  let hoveredTextId = $state<string | null>(null)
  let editingTextId = $state<string | null>(null)
  let editingText = $state('')
  let draggedTextId = $state<string | null>(null)
  let dragOffset = $state<{ x: number; y: number }>({ x: 0, y: 0 })
  let isDraggingText = $state(false)
  let lastMouseX = $state(0)
  let lastMouseY = $state(0)

  function handleContainerClick(event: MouseEvent) {
    console.log('TextInput container clicked!')

    // 클릭된 요소가 숫자 버튼이나 컨트롤 버튼인지 확인
    const target = event.target as HTMLElement
    const isButton =
      target.closest('.number-button') ||
      target.closest('.control-button') ||
      target.closest('.text-element') ||
      target.closest('.delete-button')

    if (isButton) {
      console.log('Click blocked: clicked on button or text element')
      event.stopPropagation()
      return
    }

    // 드래그가 끝난 직후라면 클릭 무시
    if (isDraggingText) {
      console.log('Click blocked: drag just ended')
      return
    }

    console.log('TextInput container click accepted')
    // 클릭 위치 계산
    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log('Input mode activated at:', x, y)
    // 인풋 모드 활성화 - 클릭한 지점에 정확히 위치하도록 조정
    isInputMode = true
    inputPosition = { x, y } // 클릭한 지점 그대로 사용
    inputText = ''

    // 다음 틱에서 인풋에 포커스
    setTimeout(() => {
      inputElement?.focus()
      // 커서를 입력 상자의 시작 위치로 설정
      if (inputElement) {
        inputElement.setSelectionRange(0, 0)
      }
    }, 0)
  }

  function handleDeleteText(textId: string) {
    textElements = textElements.filter((element) => element.id !== textId)
  }

  function handleEditText(textId: string) {
    const textElement = textElements.find((element) => element.id === textId)
    if (textElement) {
      editingTextId = textId
      editingText = textElement.text
      inputPosition = { x: textElement.x, y: textElement.y }
      isInputMode = true
      inputText = textElement.text

      // 다음 틱에서 인풋에 포커스
      setTimeout(() => {
        inputElement?.focus()
        // 전체 텍스트 선택
        if (inputElement) {
          inputElement.setSelectionRange(0, inputElement.value.length)
        }
      }, 0)
    }
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()

      if (inputText.trim()) {
        if (editingTextId) {
          // 기존 텍스트 수정
          textElements = textElements.map((element) =>
            element.id === editingTextId
              ? { ...element, text: inputText.trim() }
              : element
          )
          editingTextId = null
        } else {
          // 새 텍스트 추가
          const newTextElement = {
            id: Date.now().toString(),
            text: inputText.trim(),
            x: inputPosition.x,
            y: inputPosition.y,
          }
          textElements = [...textElements, newTextElement]
          onTextAdd(newTextElement)
        }
      }

      // 인풋 모드 종료
      isInputMode = false
      inputText = ''
    } else if (event.key === 'Escape') {
      // ESC 키로 취소
      isInputMode = false
      inputText = ''
      editingTextId = null
    }
  }

  function handleInputBlur() {
    // 포커스가 벗어나면 인풋 모드 종료
    isInputMode = false
    inputText = ''
    editingTextId = null
  }

  function handleTextMouseEnter(textId: string) {
    hoveredTextId = textId
  }

  function handleTextMouseLeave() {
    hoveredTextId = null
  }

  function handleTextMouseDown(event: MouseEvent, textId: string) {
    if (editingTextId === textId) return // 수정 중인 텍스트는 드래그 불가

    const textElement = textElements.find((element) => element.id === textId)
    if (!textElement) return

    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()

    draggedTextId = textId
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    isDraggingText = false
    lastMouseX = event.clientX
    lastMouseY = event.clientY

    event.preventDefault()
  }

  function handleTextMouseMove(event: MouseEvent) {
    if (!draggedTextId) return

    // 드래그 시작 판정을 더 민감하게
    const moveDistance = Math.sqrt(
      Math.pow(event.clientX - lastMouseX, 2) +
        Math.pow(event.clientY - lastMouseY, 2)
    )

    if (moveDistance > 3) {
      isDraggingText = true
    }

    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const newX = event.clientX - rect.left - dragOffset.x
    const newY = event.clientY - rect.top - dragOffset.y

    // 컨테이너 경계 내에서만 이동
    const maxX = rect.width - 100 // 텍스트 요소의 대략적인 너비
    const maxY = rect.height - 50 // 텍스트 요소의 대략적인 높이

    textElements = textElements.map((element) =>
      element.id === draggedTextId
        ? {
            ...element,
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          }
        : element
    )

    // 마지막 마우스 위치 업데이트
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  function handleTextMouseUp() {
    draggedTextId = null
    // 드래그가 끝난 후 약간의 지연을 두고 isDraggingText를 false로 설정
    setTimeout(() => {
      isDraggingText = false
    }, 50)
  }
</script>

<div
  class="text-input-container"
  onclick={handleContainerClick}
  onmousemove={handleTextMouseMove}
  onmouseup={handleTextMouseUp}
  role="presentation"
>
  <!-- 텍스트 요소들 -->
  {#each textElements as textElement (textElement.id)}
    {#if editingTextId !== textElement.id}
      <div
        class="text-element"
        class:hovered={hoveredTextId === textElement.id}
        class:dragging={draggedTextId === textElement.id}
        style="left: {textElement.x}px; top: {textElement.y}px;"
        onmouseenter={() => handleTextMouseEnter(textElement.id)}
        onmouseleave={handleTextMouseLeave}
        onmousedown={(e) => handleTextMouseDown(e, textElement.id)}
        role="button"
        tabindex="0"
      >
        {textElement.text}
        {#if hoveredTextId === textElement.id && !isDraggingText}
          <button
            class="edit-button"
            onclick={() => handleEditText(textElement.id)}
            title="수정"
          >
            ✏️
          </button>
          <button
            class="delete-button"
            onclick={() => handleDeleteText(textElement.id)}
            title="삭제"
          >
            ×
          </button>
        {/if}
      </div>
    {/if}
  {/each}

  <!-- 인풋 상자 -->
  {#if isInputMode}
    <input
      bind:this={inputElement}
      class="text-input"
      type="text"
      bind:value={inputText}
      style="left: {inputPosition.x}px; top: {inputPosition.y}px;"
      onkeydown={handleInputKeyDown}
      onblur={handleInputBlur}
      placeholder="문제를 입력하고, 엔터키를 누르세요... (취소는 ESC키)"
      spellcheck="false"
    />
  {/if}
</div>

<style>
  .text-input-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    z-index: 1;
  }

  .text-element {
    position: absolute;
    font-size: 30px;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    font-weight: bold;
    pointer-events: auto;
    z-index: 5;
    transform: translate(0, -50%);
    transition: all 0.2s ease;
    cursor: grab;
    padding: 8px;
    border-radius: 4px;
  }

  .text-element:hover {
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 1);
    background: rgba(255, 255, 255, 0.1);
  }

  .text-element.dragging {
    z-index: 20;
    cursor: grabbing;
    opacity: 0.8;
    transform: translate(0, -50%) scale(1.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    transition: none; /* 드래그 중에는 transition 제거 */
  }

  .delete-button {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 24px;
    height: 24px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 15;
  }

  .delete-button:hover {
    background: #c82333;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .delete-button:active {
    transform: scale(0.95);
  }

  .edit-button {
    position: absolute;
    top: -10px;
    right: 20px;
    width: 24px;
    height: 24px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 15;
  }

  .edit-button:hover {
    background: #138496;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .edit-button:active {
    transform: scale(0.95);
  }

  .text-input {
    position: absolute;
    font-size: 30px;
    background: transparent;
    border: none;
    border-bottom: 2px solid #007bff;
    border-radius: 0;
    padding: 8px 0;
    color: white;
    font-weight: bold;
    outline: none;
    z-index: 10;
    transform: translate(0, -50%);
    min-width: 350px;
    box-shadow: none;
    cursor: text;
    pointer-events: auto;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  .text-input:focus {
    border-bottom-color: #0056b3;
    box-shadow: none;
  }

  .text-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    font-size: 16px;
    font-weight: 300;
  }

  @media (max-width: 768px) {
    .text-element {
      font-size: 24px;
    }
    .text-input {
      font-size: 24px;
      min-width: 280px;
    }
    .text-input::placeholder {
      font-size: 14px;
      font-weight: 300;
    }
  }
</style>
