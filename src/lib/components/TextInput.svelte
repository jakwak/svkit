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

  function handleContainerClick(event: MouseEvent) {
    console.log('TextInput container clicked!')
    
    // 클릭된 요소가 숫자 버튼이나 컨트롤 버튼인지 확인
    const target = event.target as HTMLElement
    const isButton = target.closest('.number-button') || target.closest('.control-button') || target.closest('.text-element') || target.closest('.delete-button')
    
    if (isButton) {
      console.log('Click blocked: clicked on button or text element')
      event.stopPropagation()
      return
    }

    console.log('TextInput container click accepted')
    // 클릭 위치 계산
    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log('Input mode activated at:', x, y)
    // 인풋 모드 활성화
    isInputMode = true
    inputPosition = { x, y }
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

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      
      if (inputText.trim()) {
        // 텍스트 요소 추가
        const newTextElement = {
          id: Date.now().toString(),
          text: inputText.trim(),
          x: inputPosition.x,
          y: inputPosition.y
        }
        textElements = [...textElements, newTextElement]
        onTextAdd(newTextElement)
      }
      
      // 인풋 모드 종료
      isInputMode = false
      inputText = ''
    } else if (event.key === 'Escape') {
      // ESC 키로 취소
      isInputMode = false
      inputText = ''
    }
  }

  function handleInputBlur() {
    // 포커스가 벗어나면 인풋 모드 종료
    isInputMode = false
    inputText = ''
  }

  function handleTextMouseEnter(textId: string) {
    hoveredTextId = textId
  }

  function handleTextMouseLeave() {
    hoveredTextId = null
  }

  function handleDeleteText(textId: string) {
    textElements = textElements.filter(element => element.id !== textId)
  }
</script>

<div 
  class="text-input-container"
  onclick={handleContainerClick}
  role="presentation"
>
  <!-- 텍스트 요소들 -->
  {#each textElements as textElement (textElement.id)}
    <div 
      class="text-element"
      class:hovered={hoveredTextId === textElement.id}
      style="left: {textElement.x}px; top: {textElement.y}px;"
      onmouseenter={() => handleTextMouseEnter(textElement.id)}
      onmouseleave={handleTextMouseLeave}
      role="button"
      tabindex="0"
    >
      {textElement.text}
      {#if hoveredTextId === textElement.id}
        <button 
          class="delete-button"
          onclick={() => handleDeleteText(textElement.id)}
          title="삭제"
        >
          ×
        </button>
      {/if}
    </div>
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
      placeholder="텍스트를 입력하세요..."
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
    transform: translate(-50%, -50%);
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
  }

  .text-element:hover {
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 1);
    background: rgba(255, 255, 255, 0.1);
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

  .text-input {
    position: absolute;
    font-size: 30px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 8px 12px;
    color: #333;
    font-weight: bold;
    outline: none;
    z-index: 10;
    transform: translate(0, -50%);
    min-width: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    cursor: text;
    pointer-events: auto;
  }

  .text-input:focus {
    border-color: #0056b3;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  @media (max-width: 768px) {
    .text-element {
      font-size: 24px;
    }
    .text-input {
      font-size: 24px;
      min-width: 150px;
    }
  }
</style> 