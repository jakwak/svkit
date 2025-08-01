<script lang="ts">
  import { onMount } from 'svelte'
  const { onNumberClick, disabled = false, buttonPositions = {} } = $props<{
    onNumberClick: (number: number) => void
    disabled?: boolean
    buttonPositions?: Record<number, { x: number; y: number; size: number }>
  }>()

  let selected = $state<number | null>(null)
  let containerElement = $state<HTMLDivElement | null>(null)

  // 좌표 조정 함수
  function adjustPosition(x: number, y: number, size: number, buttonNum?: number) {
    if (!containerElement) return { x, y, size }
    
    const containerRect = containerElement.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    
    console.log('Container dimensions:', { width: containerWidth, height: containerHeight })
    console.log('Original position:', { x, y, size })
    
    // 좌표가 너무 작거나 상대 좌표가 아닌 경우 기본 배치 사용
    if ((x < 10 && y < 10) || (x >= -1 && x <= 1 && y >= -1 && y <= 1)) {
      // 일정한 간격으로 가운데 배치
      const buttonSpacing = 60 // 버튼 간격
      const totalWidth = 4 * size + 3 * buttonSpacing
      const startX = (containerWidth - totalWidth) / 2
      const centerY = containerHeight / 2 - size / 2
      
      const defaultPositions = {
        1: { x: startX, y: centerY },
        2: { x: startX + size + buttonSpacing, y: centerY },
        3: { x: startX + (size + buttonSpacing) * 2, y: centerY },
        4: { x: startX + (size + buttonSpacing) * 3, y: centerY }
      }
      
      if (buttonNum) {
        return { ...defaultPositions[buttonNum as keyof typeof defaultPositions], size }
      }
    }
    
    // KidsRoom의 component-container의 margin-top(2rem = 32px) 보정
    const marginTopOffset = 32
    const adjustedY = y - marginTopOffset
    
    // 컨테이너 중앙 기준으로 좌표 조정
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    
    // 상대 좌표(-1 ~ 1)를 절대 좌표로 변환
    let absoluteX = x
    let absoluteY = adjustedY
    
    // x, y가 -1 ~ 1 범위이면 상대 좌표로 간주
    if (x >= -1 && x <= 1 && adjustedY >= -1 && adjustedY <= 1) {
      absoluteX = centerX + (x * centerX)
      absoluteY = centerY + (adjustedY * centerY)
    }
    
    // 컨테이너 크기에 맞게 좌표 조정
    const finalX = Math.max(0, Math.min(absoluteX, containerWidth - size))
    const finalY = Math.max(0, Math.min(absoluteY, containerHeight - size))
    
    console.log('Adjusted position:', { x: finalX, y: finalY, size })
    
    return { x: finalX, y: finalY, size }
  }

  function handleClick(num: number) {
    if (disabled) return // 비활성화된 경우 클릭 무시
    
    if (selected === num) {
      // 같은 버튼을 다시 클릭하면 선택 해제
      selected = null
    } else {
      // 다른 버튼을 클릭하면 선택
      selected = num
    }
    onNumberClick(num)
  }
</script>

<div class="buttons-container">
  <div class="number-buttons" bind:this={containerElement}>
    {#each [1,2,3,4] as num}
      <button
        class="number-button btn-{num}"
        class:selected={selected === num}
        class:disabled={disabled}
        onclick={() => handleClick(num)}
        style={buttonPositions[num] ? (() => {
          const adjusted = adjustPosition(buttonPositions[num].x, buttonPositions[num].y, buttonPositions[num].size, num)
          console.log(`Button ${num} position:`, {
            original: buttonPositions[num],
            adjusted: adjusted,
            container: containerElement?.getBoundingClientRect()
          })
          return `
            position: absolute !important;
            left: ${adjusted.x}px !important;
            top: ${adjusted.y}px !important;
            width: ${adjusted.size}px !important;
            height: ${adjusted.size}px !important;
            font-size: ${adjusted.size * 0.6}px !important;
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
          `
        })() : ''}
      >
        {num}
      </button>
    {/each}
  </div>
</div>

<style>
  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 150px;
    padding: 0;
    /* padding-top: 50px; */
  }

  .number-buttons {
    display: flex;
    gap: 60px;
    align-items: center;
    width: 100%;
    justify-content: center;
    position: relative;
    height: 400px;
  }

  .number-button {
    width: 200px;
    height: 200px;
    border-radius: 25px;
    font-size: 120px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: none;
    text-shadow: none;
    background: none;
    border-radius: 50%;
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
    /* transform: translateY(-5px); */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .number-button.selected {
    border-color: #ff0000 !important;
    border-width: 6px !important;
    color: white !important;
    /* transform: translateY(-3px); */
    box-shadow: 0 6px 15px rgba(255, 0, 0, 0.3);
  }

  .number-button.selected:hover {
    /* transform: translateY(-8px); */
    box-shadow: 0 10px 25px rgba(255, 0, 0, 0.4);
  }

  .number-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }


  @media (max-width: 768px) {
    .number-buttons {
      gap: 15px;
    }
    .number-button {
      width: 120px;
      height: 120px;
      font-size: 72px;
    }
  }
</style> 