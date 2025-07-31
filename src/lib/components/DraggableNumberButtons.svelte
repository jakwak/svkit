<script lang="ts">
  import { onMount } from 'svelte'
  import TextInput from './TextInput.svelte'
  
  const { onNumberClick, disabled = false, onAlignmentChange = () => {} } = $props<{
    onNumberClick: (number: number) => void
    disabled?: boolean
    onAlignmentChange?: (isVertical: boolean) => void
  }>()

  let selected = $state<number | null>(null)
  let editingNumber = $state<number | null>(null)
  let editingText = $state<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: ''
  })
  let textElements = $state<Array<{id: string, text: string, x: number, y: number, numberId: number}>>([])
  let clickPosition = $state<{x: number, y: number} | null>(null)
  let buttonPositions = $state<Record<number, { x: number; y: number }>>({
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
    3: { x: 0, y: 0 },
    4: { x: 0, y: 0 }
  })
  
  let draggedButton = $state<number | null>(null)
  let draggedTextId = $state<string | null>(null)
  let dragOffset = $state<{ x: number; y: number }>({ x: 0, y: 0 })
  let containerElement = $state<HTMLDivElement | null>(null)
  let isDragging = $state(false)
  let hasDragged = $state(false)
  let initialPositions = $state<Record<number, { x: number; y: number }>>({})
  let buttonSize = $state(64)
  let isVerticalAlignment = $state(false)

  
  // 성능 최적화를 위한 캐시 변수들
  let containerRect = $state<DOMRect | null>(null)
  let lastMouseX = $state(0)
  let lastMouseY = $state(0)
  let inputElement = $state<HTMLInputElement | null>(null)



  function handleClick(num: number) {
    if (disabled) return
    
    // 드래그 중이거나 최근에 드래그했다면 클릭 무시
    if (isDragging || hasDragged) {
      console.log('Click ignored due to drag')
      return
    }
    
    console.log('Button clicked:', num)
    
    if (selected === num) {
      selected = null
    } else {
      selected = num
    }
    onNumberClick(num)
  }







  function handleMouseDown(event: MouseEvent, num: number) {
    if (disabled) return
    
    // 클릭 시작 시 드래그 상태 초기화
    hasDragged = false
    isDragging = false
    
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    
    // 컨테이너 rect 캐시
    if (containerElement) {
      containerRect = containerElement.getBoundingClientRect()
    }
    
    draggedButton = num
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    lastMouseX = event.clientX
    lastMouseY = event.clientY
    
    // 드래그 중일 때 텍스트 선택 방지
    event.preventDefault()
  }

  function handleContainerMouseDown(event: MouseEvent, num: number) {
    if (disabled) return
    
    // 클릭 시작 시 드래그 상태 초기화
    hasDragged = false
    isDragging = false
    
    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    
    // 컨테이너 rect 캐시
    if (containerElement) {
      containerRect = containerElement.getBoundingClientRect()
    }
    
    draggedButton = num
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    lastMouseX = event.clientX
    lastMouseY = event.clientY
    
    // 드래그 중일 때 텍스트 선택 방지
    event.preventDefault()
  }

  function handleMouseMove(event: MouseEvent) {
    if (!draggedButton && !draggedTextId || !containerElement || !containerRect) return
    
    // 드래그 시작 판정을 더 관대하게 (5px로 변경)
    const moveDistance = Math.sqrt(
      Math.pow(event.clientX - lastMouseX, 2) +
      Math.pow(event.clientY - lastMouseY, 2)
    )
    
    if (moveDistance > 5) {
      isDragging = true
      hasDragged = true
    }
    
    const newX = event.clientX - containerRect.left - dragOffset.x
    const newY = event.clientY - containerRect.top - dragOffset.y
    
    if (draggedButton) {
      // 버튼 드래그
      const maxX = containerRect.width - buttonSize
      const maxY = containerRect.height - buttonSize
      
      buttonPositions[draggedButton] = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }
    } else if (draggedTextId) {
      // 텍스트 드래그
      const textElement = textElements.find(t => t.id === draggedTextId)
      if (textElement) {
        const maxX = containerRect.width - 100 // 텍스트 너비 추정
        const maxY = containerRect.height - 30 // 텍스트 높이 추정
        
        textElements = textElements.map(t => 
          t.id === draggedTextId 
            ? { ...t, x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) }
            : t
        )
      }
    }
    
    // 마지막 마우스 위치 업데이트
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  function handleMouseUp() {
    draggedButton = null
    draggedTextId = null
    isDragging = false
    containerRect = null
    // 드래그가 끝나면 hasDragged를 false로 리셋하여 클릭 이벤트가 정상 작동하도록 함
    setTimeout(() => {
      hasDragged = false
    }, 10)
  }

  function handleTextMouseDown(event: MouseEvent, textId: string) {
    if (disabled) return
    
    const textElement = textElements.find(t => t.id === textId)
    if (!textElement) return
    
    const element = event.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()
    
    if (containerElement) {
      containerRect = containerElement.getBoundingClientRect()
    }
    
    // 텍스트 드래그 상태 설정
    draggedTextId = textId
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    lastMouseX = event.clientX
    lastMouseY = event.clientY
    
    event.preventDefault()
  }

  function resetToInitialPositions() {
    buttonPositions = { ...initialPositions }
    buttonSize = 64 // 원래 크기로 복원
    isVerticalAlignment = false
    onAlignmentChange(false) // 부모에게 가로 정렬 상태 알림
  }

  function alignVertically() {
    if (containerElement) {
      buttonSize = 64 // 버튼 크기 유지
      isVerticalAlignment = true
      const buttonWidth = buttonSize
      const buttonHeight = buttonSize
      const containerWidth = containerElement.offsetWidth
      const containerHeight = containerElement.offsetHeight
      
      // 가로 기준 1/6 지점 (왼쪽에서 1/6)
      const xPosition = containerWidth / 6
      
      // 세로 중앙 정렬을 위한 시작 Y 위치
      const totalHeight = 4 * buttonHeight + 3 * 20 // 버튼 간격 20px
      const startY = (containerHeight - totalHeight) / 2
      
      const verticalPositions = {
        1: { x: xPosition, y: startY },
        2: { x: xPosition, y: startY + buttonHeight + 20 },
        3: { x: xPosition, y: startY + (buttonHeight + 20) * 2 },
        4: { x: xPosition, y: startY + (buttonHeight + 20) * 3 }
      }
      
      buttonPositions = verticalPositions
      onAlignmentChange(true) // 부모에게 세로 정렬 상태 알림
    }
  }

  onMount(() => {
    // 컨테이너가 마운트된 후 위치 계산
    setTimeout(() => {
      if (containerElement) {
        const buttonWidth = 64
        const containerWidth = containerElement.offsetWidth
        const totalButtonWidth = 4 * buttonWidth
        const availableSpace = containerWidth - totalButtonWidth
        const spacing = availableSpace / 5 // 5개 구간으로 나누어 균등 분배
        
        const positions = {
          1: { x: spacing, y: 150 },
          2: { x: spacing * 2 + buttonWidth, y: 150 },
          3: { x: spacing * 3 + buttonWidth * 2, y: 150 },
          4: { x: spacing * 4 + buttonWidth * 3, y: 150 }
        }
        initialPositions = positions
        buttonPositions = { ...positions }
      }
    }, 0)
    
    // 전역 마우스 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  })
</script>

      <div 
      class="buttons-container"
      bind:this={containerElement}
      onmousemove={handleMouseMove}
      onmouseup={handleMouseUp}

      role="presentation"
    >
    <div class="number-buttons">
      {#each [1,2,3,4] as num}
        <div 
          class="button-container"
          style="transform: translate({buttonPositions[num].x}px, {buttonPositions[num].y}px);"
          onmousedown={(e) => handleContainerMouseDown(e, num)}
          role="button"
          tabindex="0"
        >
          <button
            class="number-button btn-{num}"
            class:selected={selected === num}
            class:disabled={disabled}
            class:dragging={draggedButton === num}
            style="width: {buttonSize}px; height: {buttonSize}px; font-size: {buttonSize * 0.6}px;"
            onclick={() => handleClick(num)}
            onmousedown={(e) => handleMouseDown(e, num)}
          >
            {num}
          </button>
          

          
          <!-- 편집 버튼 -->
          <button 
            class="action-button edit-button"
            title="편집"
            aria-label="편집"
            onclick={(e) => {
              e.stopPropagation()
              editingNumber = num
              // 클릭한 위치 저장
              if (containerElement) {
                const rect = containerElement.getBoundingClientRect()
                clickPosition = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                }
              }
              console.log('Edit button clicked for number:', num)
              // 다음 틱에서 입력상자에 포커스
              setTimeout(() => {
                if (inputElement) {
                  inputElement.focus()
                }
              }, 0)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M8 2l2 2-6 6H2V8l6-6z"/>
            </svg>
          </button>
          
          <!-- 편집 입력상자 -->
          {#if editingNumber === num}
            <div class="edit-input-container">
              <input
                bind:this={inputElement}
                class="edit-input"
                type="text"
                bind:value={editingText[num]}
                placeholder="텍스트 입력..."
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingText[num].trim() && clickPosition) {
                      const textId = `text-${Date.now()}-${Math.random()}`
                      textElements = [...textElements, {
                        id: textId,
                        text: editingText[num],
                        x: clickPosition.x,
                        y: clickPosition.y,
                        numberId: num
                      }]
                      editingText[num] = ''
                      clickPosition = null
                    }
                    editingNumber = null
                  } else if (e.key === 'Escape') {
                    editingNumber = null
                    editingText[num] = ''
                    clickPosition = null
                  }
                }}
                onblur={() => {
                  editingNumber = null
                  clickPosition = null
                }}
                spellcheck="false"
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- 텍스트 요소들 -->
    {#each textElements as textElement (textElement.id)}
      <div 
        class="text-element"
        style="transform: translate({textElement.x}px, {textElement.y}px);"
        onmousedown={(e) => handleTextMouseDown(e, textElement.id)}
        role="button"
        tabindex="0"
      >
        {textElement.text}
      </div>
    {/each}

    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;">
      <TextInput onTextAdd={(textElement) => {
        console.log('Text added:', textElement)
      }} />
    </div>
    
    <div class="alignment-controls">
      <button 
        class="alignment-button"
        class:active={!isVerticalAlignment}
        onclick={resetToInitialPositions}
        title="가로 정렬"
        aria-label="가로 정렬"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 8h12M6 4l-4 4 4 4M10 4l4 4-4 4"/>
        </svg>
      </button>
      <button 
        class="alignment-button"
        class:active={isVerticalAlignment}
        onclick={alignVertically}
        title="세로 정렬"
        aria-label="세로 정렬"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4"/>
        </svg>
      </button>
    </div>
  </div>

<style>
  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 5px;
    position: relative;
    border: none;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    cursor: text; /* 텍스트 입력 가능함을 표시 */
  }

  .number-buttons {
    position: relative;
    width: 100%;
    height: 100%;
  }





  .alignment-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 1000;
  }

  .alignment-button {
    width: 32px;
    height: 32px;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0;
  }

  .alignment-button svg {
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .alignment-button:hover {
    color: rgba(255, 255, 255, 0.9);
    transform: scale(1.05);
  }

  .alignment-button:active {
    transform: scale(0.95);
  }

  .alignment-button.active {
    color: #ffffff;
  }

  .alignment-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #ffffff;
    border-radius: 1px;
  }

  .alignment-button.active:hover {
    color: #ffffff;
  }



  .button-container {
    position: absolute;
    z-index: 2;
  }

  .number-button {
    position: relative;
    border-radius: 50%;
    font-weight: bold;
    cursor: grab;
    transition: all 0.3s ease;
    box-shadow: none;
    text-shadow: none;
    background: none;
    user-select: none;
    will-change: transform; /* 성능 최적화 */
    pointer-events: auto;
  }

  .action-button {
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(107, 114, 128, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    transition: all 0.2s ease;
    z-index: 10;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    opacity: 0;
    pointer-events: none;
  }

  .button-container:hover .action-button {
    opacity: 1;
    pointer-events: auto;
  }

  .edit-button {
    top: -8px;
    right: -8px;
  }

  .action-button:hover {
    background: rgba(59, 130, 246, 0.9);
    transform: scale(1.1);
  }

  .action-button:active {
    transform: scale(0.95);
  }

  .action-button.active {
    background: rgba(239, 68, 68, 0.9);
  }

  .action-button.active:hover {
    background: rgba(220, 38, 38, 0.9);
  }

  .action-button svg {
    stroke: currentColor;
    stroke-width: 1.5;
    fill: none;
  }

  .edit-input-container {
    position: absolute;
    top: 50%;
    left: calc(100% + 10px);
    transform: translateY(-50%);
    z-index: 15;
  }

  .edit-input {
    background: rgba(0, 0, 0, 0.8);
    border: none;
    border-bottom: 2px solid #ffffff;
    color: #ffffff;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px 4px 0 0;
    min-width: 200px;
    outline: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .edit-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 300;
  }

  .edit-input:focus {
    border-bottom-color: #3b82f6;
  }

  .text-element {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: grab;
    user-select: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 5;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .text-element:active {
    cursor: grabbing;
  }

  .number-button.dragging {
    z-index: 10;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: none; /* 드래그 중에는 transition 제거 */
  }

  .number-button:active {
    cursor: grabbing;
  }

  .btn-1 {
    background: none;
    border: 4px solid #6b7280;
    color: #6b7280;
  }
  .btn-1:hover {
    background: #6b7280;
    color: white;
  }
  .btn-2 {
    background: none;
    border: 4px solid #6b7280;
    color: #6b7280;
  }
  .btn-2:hover {
    background: #6b7280;
    color: white;
  }
  .btn-3 {
    background: none;
    border: 4px solid #6b7280;
    color: #6b7280;
  }
  .btn-3:hover {
    background: #6b7280;
    color: white;
  }
  .btn-4 {
    background: none;
    border: 4px solid #6b7280;
    color: #6b7280;
  }
  .btn-4:hover {
    background: #6b7280;
    color: white;
  }

  .number-button:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .number-button.selected {
    border-color: #ff0000 !important;
    border-width: 6px !important;
    color: white !important;
    box-shadow: 0 6px 15px rgba(255, 0, 0, 0.3);
  }

  .number-button.selected:hover {
    box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
  }

  .number-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .buttons-container {
      height: 100%;
      padding: 5px;
    }
    .number-button {
      width: 64px;
      height: 64px;
      font-size: 32px;
    }
    .alignment-button {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }
</style> 