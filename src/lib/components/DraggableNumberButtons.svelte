<script lang="ts">
  import { onMount } from 'svelte'
  
  const { onNumberClick, disabled = false, onAlignmentChange = () => {} } = $props<{
    onNumberClick: (number: number) => void
    disabled?: boolean
    onAlignmentChange?: (isVertical: boolean) => void
  }>()

  let selected = $state<number | null>(null)
  let buttonPositions = $state<Record<number, { x: number; y: number }>>({
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
    3: { x: 0, y: 0 },
    4: { x: 0, y: 0 }
  })
  
  let draggedButton = $state<number | null>(null)
  let dragOffset = $state<{ x: number; y: number }>({ x: 0, y: 0 })
  let containerElement = $state<HTMLDivElement | null>(null)
  let isDragging = $state(false)
  let hasDragged = $state(false)
  let initialPositions = $state<Record<number, { x: number; y: number }>>({})
  let buttonSize = $state(134)
  let isVerticalAlignment = $state(false)
  
  // 성능 최적화를 위한 캐시 변수들
  let containerRect = $state<DOMRect | null>(null)
  let lastMouseX = $state(0)
  let lastMouseY = $state(0)

  function handleClick(num: number) {
    if (disabled) return
    
    if (isDragging || hasDragged) return
    
    if (selected === num) {
      selected = null
    } else {
      selected = num
    }
    onNumberClick(num)
  }

  function handleMouseDown(event: MouseEvent, num: number) {
    if (disabled) return
    
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

  function handleMouseMove(event: MouseEvent) {
    if (!draggedButton || !containerElement || !containerRect) return
    
    // 드래그 시작 판정을 더 민감하게 (1px로 변경)
    const moveDistance = Math.sqrt(
      Math.pow(event.clientX - lastMouseX, 2) +
      Math.pow(event.clientY - lastMouseY, 2)
    )
    
    if (moveDistance > 1) {
      isDragging = true
      hasDragged = true
    }
    
    const newX = event.clientX - containerRect.left - dragOffset.x
    const newY = event.clientY - containerRect.top - dragOffset.y
    
    // 컨테이너 경계 내에서만 이동
    const maxX = containerRect.width - buttonSize
    const maxY = containerRect.height - buttonSize
    
    buttonPositions[draggedButton] = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }
    
    // 마지막 마우스 위치 업데이트
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  function handleMouseUp() {
    draggedButton = null
    isDragging = false
    containerRect = null
  }

  function resetToInitialPositions() {
    buttonPositions = { ...initialPositions }
    buttonSize = 134 // 원래 크기로 복원
    isVerticalAlignment = false
    onAlignmentChange(false) // 부모에게 가로 정렬 상태 알림
  }

  function alignVertically() {
    if (containerElement) {
      buttonSize = 67 // 버튼 크기를 1/2로 줄임
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
        const buttonWidth = 134 // 67 * 2 = 134
        const buttonSpacing = 80 // 간격 유지
        const totalWidth = (4 * buttonWidth) + (3 * buttonSpacing)
        const containerWidth = containerElement.offsetWidth
        const startX = (containerWidth - totalWidth) / 2
        
        const positions = {
          1: { x: startX, y: 150 },
          2: { x: startX + buttonWidth + buttonSpacing, y: 150 },
          3: { x: startX + (buttonWidth + buttonSpacing) * 2, y: 150 },
          4: { x: startX + (buttonWidth + buttonSpacing) * 3, y: 150 }
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
                 <button
           class="number-button btn-{num}"
           class:selected={selected === num}
           class:disabled={disabled}
           class:dragging={draggedButton === num}
           style="transform: translate({buttonPositions[num].x}px, {buttonPositions[num].y}px); width: {buttonSize}px; height: {buttonSize}px; font-size: {buttonSize * 0.6}px;"
           onclick={() => handleClick(num)}
           onmousedown={(e) => handleMouseDown(e, num)}
         >
          {num}
        </button>
      {/each}
    </div>
    
    <div class="button-group">
      <button 
        class="control-button"
        class:active={!isVerticalAlignment}
        onclick={resetToInitialPositions}
      >
        ↔️ 가로정렬
      </button>
      <button 
        class="control-button"
        class:active={isVerticalAlignment}
        onclick={alignVertically}
      >
        ↕️ 세로정렬
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
  }

  .number-buttons {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .button-group {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 100;
  }

  .control-button {
    padding: 10px 20px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .control-button:hover {
    background: #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .control-button:active {
    transform: scale(0.95);
  }

  .control-button.active {
    background: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .control-button.active:hover {
    background: #059669;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .number-button {
    position: absolute;
    border-radius: 16px;
    font-weight: bold;
    cursor: grab;
    transition: all 0.3s ease;
    box-shadow: none;
    text-shadow: none;
    background: none;
    user-select: none;
    z-index: 1;
    will-change: transform; /* 성능 최적화 */
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
      width: 80px;
      height: 80px;
      font-size: 48px;
    }
  }
</style> 