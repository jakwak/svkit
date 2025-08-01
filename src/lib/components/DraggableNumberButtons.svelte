<script lang="ts">
  import { onMount } from 'svelte'

  const {
    onNumberClick,
    disabled = false,
    onAlignmentChange = () => {},
    onSendButtonPositions = () => {},
    isStudentMode = false,
    receivedButtonPositions = {},
  } = $props<{
    onNumberClick: (number: number) => void
    disabled?: boolean
    onAlignmentChange?: (isVertical: boolean) => void
    onSendButtonPositions?: (positions: Record<number, { x: number; y: number; size: number; text?: string }>) => void
    isStudentMode?: boolean
    receivedButtonPositions?: Record<number, { x: number; y: number; size: number; text?: string }>
  }>()

  let selected = $state<number | null>(null)
  let editingNumber = $state<number | null>(null)
  let editingText = $state<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
  })
  let editingTextId = $state<string | null>(null)
  let textElements = $state<
    Array<{ id: string; text: string; x: number; y: number; numberId: number }>
  >([])
  let clickPosition = $state<{ x: number; y: number } | null>(null)
  let buttonPositions = $state<Record<number, { x: number; y: number }>>({
    1: { x: 0, y: 0 },
    2: { x: 0, y: 0 },
    3: { x: 0, y: 0 },
    4: { x: 0, y: 0 },
  })

  let draggedButton = $state<number | null>(null)
  let draggedTextId = $state<string | null>(null)
  let dragOffset = $state<{ x: number; y: number }>({ x: 0, y: 0 })
  let containerElement = $state<HTMLDivElement | null>(null)
  let isDragging = $state(false)
  let hasDragged = $state(false)
  let initialPositions = $state<Record<number, { x: number; y: number }>>({})
  let buttonSize = $state(48)
  let isVerticalAlignment = $state(false)

  // 학생 모드에서 받은 위치 정보 처리
  let lastReceivedPositions = $state<Record<number, { x: number; y: number; size: number; text?: string }>>({})
  
  $effect(() => {
    if (isStudentMode && Object.keys(receivedButtonPositions).length > 0) {
      // 이전 위치와 비교하여 실제 변경이 있는지 확인
      let hasChanges = false
      for (let i = 1; i <= 4; i++) {
        const current = receivedButtonPositions[i]
        const previous = lastReceivedPositions[i]
        
        if (current && (!previous || 
            current.x !== previous.x || 
            current.y !== previous.y || 
            current.size !== previous.size ||
            current.text !== previous.text)) {
          hasChanges = true
          break
        }
      }
      
      if (!hasChanges) {
        return
      }
      
      if (containerElement) {
        const containerRect = containerElement.getBoundingClientRect()
        const containerWidth = containerRect.width
        const containerHeight = containerRect.height
        
        // 컨테이너 높이가 0이거나 매우 작은 경우 경고
        if (containerHeight < 10) {
          console.warn('컨테이너 높이가 매우 작습니다:', containerHeight)
        }
        
        // 상대 좌표를 절대 좌표로 변환
        const newPositions: Record<number, { x: number; y: number }> = {}
        
        // 학생 모드에서 텍스트 요소 업데이트
        const newTextElements: Array<{ id: string; text: string; x: number; y: number; numberId: number }> = []
        
        for (let i = 1; i <= 4; i++) {
          if (receivedButtonPositions[i]) {
            const centerX = containerWidth / 2
            const centerY = containerHeight / 2
            const relativeX = receivedButtonPositions[i].x
            const relativeY = receivedButtonPositions[i].y
            
            // 상대 좌표(-1 ~ 1)를 절대 좌표로 변환
            const absoluteX = centerX + (relativeX * centerX)
            const absoluteY = centerY + (relativeY * centerY)
            
            newPositions[i] = {
              x: absoluteX,
              y: absoluteY
            }
            
            // 텍스트가 있으면 텍스트 요소 생성
            if (receivedButtonPositions[i].text) {
              const textId = `received-text-${i}-${Date.now()}`
              newTextElements.push({
                id: textId,
                text: receivedButtonPositions[i].text!,
                x: absoluteX + buttonSize + 10, // 버튼 오른쪽에 10px 간격
                y: absoluteY + buttonSize / 2 - 15, // 버튼 중앙 높이에 맞춤
                numberId: i
              })
            }
            
            // 버튼 크기도 업데이트
            buttonSize = receivedButtonPositions[i].size
          }
        }
        
        // 학생 모드에서 텍스트 요소 업데이트
        if (isStudentMode) {
          textElements = newTextElements
        }
        
        // 애니메이션으로 부드럽게 이동
        animateButtonPositions(newPositions)
        
        // 현재 위치를 마지막 위치로 저장
        lastReceivedPositions = { ...receivedButtonPositions }
      }
    }
  })

  // 성능 최적화를 위한 캐시 변수들
  let containerRect = $state<DOMRect | null>(null)
  let lastMouseX = $state(0)
  let lastMouseY = $state(0)
  let inputElement = $state<HTMLInputElement | null>(null)

  // 애니메이션 함수
  function animateButtonPositions(
    targetPositions: Record<number, { x: number; y: number }>,
    onComplete?: () => void
  ) {
    const duration = 500 // 0.5초
    const startTime = performance.now()
    const startPositions = { ...buttonPositions }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // easeInOutCubic 함수로 부드러운 애니메이션
      const easeProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

      // 각 버튼의 위치를 보간
      const newPositions: Record<number, { x: number; y: number }> = {}
      for (let i = 1; i <= 4; i++) {
        const start = startPositions[i]
        const target = targetPositions[i]
        newPositions[i] = {
          x: start.x + (target.x - start.x) * easeProgress,
          y: start.y + (target.y - start.y) * easeProgress,
        }
      }

      buttonPositions = newPositions

      // 연결된 텍스트들도 함께 애니메이션
      textElements = textElements.map((textElement) => {
        const buttonNumber = textElement.numberId
        const startButtonPos = startPositions[buttonNumber]
        const targetButtonPos = targetPositions[buttonNumber]

        if (startButtonPos && targetButtonPos) {
          // 텍스트의 고정된 오프셋 (버튼 오른쪽에 10px 간격, 중앙 높이)
          const fixedOffsetX = buttonSize + 10
          const fixedOffsetY = buttonSize / 2 - 15

          // 새로운 버튼 위치에 고정 오프셋을 더해서 텍스트 위치 계산
          const newButtonX =
            startButtonPos.x +
            (targetButtonPos.x - startButtonPos.x) * easeProgress
          const newButtonY =
            startButtonPos.y +
            (targetButtonPos.y - startButtonPos.y) * easeProgress

          return {
            ...textElement,
            x: newButtonX + fixedOffsetX,
            y: newButtonY + fixedOffsetY,
          }
        }
        return textElement
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 애니메이션 완료 후 콜백 실행
        if (onComplete) {
          onComplete()
        }
      }
    }

    requestAnimationFrame(animate)
  }

  function handleClick(num: number) {
    if (disabled) return

    // 드래그 중이거나 최근에 드래그했다면 클릭 무시 (더 엄격한 조건)
    if (
      isDragging ||
      hasDragged ||
      draggedButton !== null ||
      draggedTextId !== null
    ) {
      return
    }

    if (selected === num) {
      selected = null
    } else {
      selected = num
    }
    onNumberClick(num)
  }

  function handleMouseDown(event: MouseEvent, num: number) {
    if (disabled || isStudentMode) return

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
      y: event.clientY - rect.top,
    }

    lastMouseX = event.clientX
    lastMouseY = event.clientY

    // 드래그 중일 때 텍스트 선택 방지
    event.preventDefault()
  }

  function handleContainerMouseDown(event: MouseEvent, num: number) {
    if (disabled || isStudentMode) return

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
      y: event.clientY - rect.top,
    }

    lastMouseX = event.clientX
    lastMouseY = event.clientY

    // 드래그 중일 때 텍스트 선택 방지
    event.preventDefault()
  }

  function handleMouseMove(event: MouseEvent) {
    if (
      (!draggedButton && !draggedTextId) ||
      !containerElement ||
      !containerRect
    )
      return

    // 드래그 시작 판정을 더 엄격하게 (5px로 변경)
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

      const newButtonX = Math.max(0, Math.min(newX, maxX))
      const newButtonY = Math.max(0, Math.min(newY, maxY))

      // 이전 버튼 위치 저장
      const oldButtonX = buttonPositions[draggedButton].x
      const oldButtonY = buttonPositions[draggedButton].y

      // 버튼 위치 업데이트
      buttonPositions[draggedButton] = {
        x: newButtonX,
        y: newButtonY,
      }

      // 연결된 텍스트들도 함께 이동
      textElements = textElements.map((textElement) => {
        if (textElement.numberId === draggedButton) {
          const textOffsetX = textElement.x - oldButtonX
          const textOffsetY = textElement.y - oldButtonY
          return {
            ...textElement,
            x: newButtonX + textOffsetX,
            y: newButtonY + textOffsetY,
          }
        }
        return textElement
      })
    } else if (draggedTextId) {
      // 텍스트 드래그
      const textElement = textElements.find((t) => t.id === draggedTextId)
      if (textElement) {
        const maxX = containerRect.width - 100 // 텍스트 너비 추정
        const maxY = containerRect.height - 30 // 텍스트 높이 추정

        const newTextX = Math.max(0, Math.min(newX, maxX))
        const newTextY = Math.max(0, Math.min(newY, maxY))

        // 이전 텍스트 위치 저장
        const oldTextX = textElement.x
        const oldTextY = textElement.y

        // 텍스트 위치 업데이트
        textElements = textElements.map((t) =>
          t.id === draggedTextId ? { ...t, x: newTextX, y: newTextY } : t
        )

        // 연결된 버튼도 함께 이동
        const buttonNumber = textElement.numberId
        const buttonOffsetX = buttonPositions[buttonNumber].x - oldTextX
        const buttonOffsetY = buttonPositions[buttonNumber].y - oldTextY

        buttonPositions[buttonNumber] = {
          x: newTextX + buttonOffsetX,
          y: newTextY + buttonOffsetY,
        }
      }
    }

    // 마지막 마우스 위치 업데이트
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  function handleMouseUp() {
    const wasDragging = isDragging || hasDragged
    draggedButton = null
    draggedTextId = null
    isDragging = false
    containerRect = null
    
    // 드래그가 끝나면 hasDragged를 false로 리셋하여 클릭 이벤트가 정상 작동하도록 함
    setTimeout(() => {
      hasDragged = false
    }, 200) // 시간을 더 늘려서 드래그 후 클릭 이벤트 방지
    
    // 드래그가 완료되면 자동으로 전송
    if (wasDragging && !isStudentMode) {
      setTimeout(() => {
        sendButtonPositions()
      }, 100) // 약간의 지연을 두어 애니메이션이 완료된 후 전송
    }
  }

  function handleTextMouseDown(event: MouseEvent, textId: string) {
    if (disabled) return

    const textElement = textElements.find((t) => t.id === textId)
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
      y: event.clientY - rect.top,
    }

    lastMouseX = event.clientX
    lastMouseY = event.clientY

    event.preventDefault()
  }

  function sendButtonPositions() {
    const positions: Record<number, { x: number; y: number; size: number; text?: string }> = {}
    
    if (containerElement) {
      const containerRect = containerElement.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      for (let i = 1; i <= 4; i++) {
        // 컨테이너 중앙 기준 상대 좌표로 변환
        const centerX = containerWidth / 2
        const centerY = containerHeight / 2
        const relativeX = (buttonPositions[i].x - centerX) / centerX // -1 ~ 1 범위
        const relativeY = (buttonPositions[i].y - centerY) / centerY // -1 ~ 1 범위
        
        // 해당 버튼에 연결된 텍스트 찾기
        const textElement = textElements.find(text => text.numberId === i)
        
        positions[i] = {
          x: relativeX,
          y: relativeY,
          size: buttonSize,
          text: textElement?.text || undefined
        }
      }
    } else {
      // 컨테이너가 없으면 절대 좌표 사용
      for (let i = 1; i <= 4; i++) {
        const textElement = textElements.find(text => text.numberId === i)
        positions[i] = {
          x: buttonPositions[i].x,
          y: buttonPositions[i].y,
          size: buttonSize,
          text: textElement?.text || undefined
        }
      }
    }
    
    // 부모 컴포넌트에 전송 (AdminRoom에서 서버로 전송)
    onSendButtonPositions(positions)
  }

  function resetToInitialPositions() {
    if (containerElement) {
      const buttonWidth = 48
      const containerWidth = containerElement.offsetWidth
      const containerHeight = containerElement.offsetHeight

      // 각 버튼에 연결된 텍스트가 있는지 확인
      const buttonsWithText = new Set<number>()
      textElements.forEach((textElement) => {
        buttonsWithText.add(textElement.numberId)
      })

      // 텍스트가 있는 버튼과 없는 버튼을 구분하여 간격 계산
      const textButtonWidth = buttonWidth + 250 // 텍스트가 있는 버튼의 예상 너비 (더 넓게)
      const normalButtonWidth = buttonWidth
      const spacing = 30 // 기본 간격 (더 넓게)

      // 1줄로 배치했을 때의 총 너비 계산
      let totalWidth = 0
      for (let i = 1; i <= 4; i++) {
        totalWidth +=
          (buttonsWithText.has(i) ? textButtonWidth : normalButtonWidth) +
          spacing
      }
      totalWidth -= spacing // 마지막 간격 제거

      // 1줄로 배치 가능한지 확인 (더 엄격한 조건)
      const canFitInOneLine = totalWidth <= containerWidth - 100

      const positions: Record<number, { x: number; y: number }> = {}

      if (canFitInOneLine) {
        // 1줄로 배치 (균등 간격, 가운데 정렬)

        // 각 버튼의 실제 너비 계산
        const buttonWidths = []
        for (let i = 1; i <= 4; i++) {
          buttonWidths.push(
            buttonsWithText.has(i) ? textButtonWidth : normalButtonWidth
          )
        }

        // 총 너비 계산
        const totalButtonWidth = buttonWidths.reduce(
          (sum, width) => sum + width,
          0
        )

        // 균등한 간격 계산 (5개 구간: 버튼1-간격-버튼2-간격-버튼3-간격-버튼4-간격)
        const totalGaps = 3 // 버튼 사이의 간격 개수
        const availableSpace = containerWidth - totalButtonWidth
        const equalSpacing = availableSpace / (totalGaps + 2) // 양 끝 여백 + 버튼 사이 간격

        // 가운데 정렬을 위한 시작 위치 계산
        const centerY = containerHeight / 2 - buttonSize / 2 // 세로 중앙
        let currentX = equalSpacing
        for (let i = 1; i <= 4; i++) {
          positions[i] = { x: currentX, y: centerY }
          currentX += buttonWidths[i - 1] + equalSpacing
        }
      } else {
        // 2줄로 배치 (2개씩)
        const firstRowY = 100
        const secondRowY = 200
        const centerX = containerWidth / 2

        // 첫 번째 줄 (1, 2번 버튼)
        let firstRowWidth = 0
        for (let i = 1; i <= 2; i++) {
          firstRowWidth +=
            (buttonsWithText.has(i) ? textButtonWidth : normalButtonWidth) +
            spacing
        }
        firstRowWidth -= spacing

        // 두 번째 줄 (3, 4번 버튼)
        let secondRowWidth = 0
        for (let i = 3; i <= 4; i++) {
          secondRowWidth +=
            (buttonsWithText.has(i) ? textButtonWidth : normalButtonWidth) +
            spacing
        }
        secondRowWidth -= spacing

        // 2줄로도 겹치는지 확인 (더 엄격한 조건)
        const maxRowWidth = Math.max(firstRowWidth, secondRowWidth)
        const canFitInTwoLines = maxRowWidth <= containerWidth - 150

        if (canFitInTwoLines) {
          // 2줄로 배치 (숫자 버튼 기준으로 가로 위치 맞춤)
          const centerY = containerHeight / 2 - buttonSize / 2 // 세로 중앙
          const firstRowY = centerY - buttonSize - 20 // 첫 번째 줄 (중앙에서 위로)
          const secondRowY = centerY + 20 // 두 번째 줄 (중앙에서 아래로)
          
          // 첫 번째 줄: 숫자 버튼 기준으로 정렬
          let currentX = centerX - firstRowWidth / 2
          for (let i = 1; i <= 2; i++) {
            positions[i] = { x: currentX, y: firstRowY }
            currentX +=
              (buttonsWithText.has(i) ? textButtonWidth : normalButtonWidth) +
              spacing
          }

          // 두 번째 줄: 첫 번째 줄의 숫자 버튼 위치와 맞춤
          const firstButtonX = positions[1].x
          const secondButtonX = positions[2].x

          // 두 번째 줄의 첫 번째 버튼(3번)을 첫 번째 줄의 첫 번째 버튼(1번)과 같은 X 위치에 배치
          positions[3] = { x: firstButtonX, y: secondRowY }

          // 두 번째 줄의 두 번째 버튼(4번)을 첫 번째 줄의 두 번째 버튼(2번)과 같은 X 위치에 배치
          positions[4] = { x: secondButtonX, y: secondRowY }
        } else {
          // 세로 정렬로 자동 전환
          isVerticalAlignment = true
          onAlignmentChange(true) // 부모에게 세로 정렬 상태 알림
          alignVertically()
          return // 세로 정렬 함수가 처리하므로 여기서 종료
        }
      }

      // 애니메이션으로 부드럽게 이동
      animateButtonPositions(positions, () => {
        // 가로 정렬 완료 후 자동으로 전송
        if (!isStudentMode) {
          setTimeout(() => {
            sendButtonPositions()
          }, 100)
        }
      })
      buttonSize = 48 // 원래 크기로 복원
      isVerticalAlignment = false
      onAlignmentChange(false) // 부모에게 가로 정렬 상태 알림
    }
  }

  function alignVertically() {
    if (containerElement) {
      buttonSize = 48 // 버튼 크기 유지
      isVerticalAlignment = true
      const buttonWidth = buttonSize
      const buttonHeight = buttonSize
      const containerWidth = containerElement.offsetWidth
      const containerHeight = containerElement.offsetHeight

      // 각 버튼에 연결된 텍스트가 있는지 확인
      const buttonsWithText = new Set<number>()
      textElements.forEach((textElement) => {
        buttonsWithText.add(textElement.numberId)
      })

      // 텍스트가 있는 버튼은 더 넓은 간격을 두고 배치
      const textButtonSpacing = 80 // 텍스트가 있는 버튼 간격
      const normalButtonSpacing = 40 // 일반 버튼 간격

      // 균등한 세로 간격 계산
      const totalButtonHeight = 4 * buttonHeight
      const totalGaps = 3 // 버튼 사이의 간격 개수
      const availableHeight = containerHeight - totalButtonHeight
      const equalSpacing = availableHeight / (totalGaps + 2) // 양 끝 여백 + 버튼 사이 간격

      // 세로 중앙 정렬을 위한 시작 Y 위치 계산
      const startY = equalSpacing

      // 가로 기준 1/6 지점 (왼쪽에서 1/6)
      const xPosition = containerWidth / 6

      let currentY = startY
      const verticalPositions: Record<number, { x: number; y: number }> = {}

      for (let i = 1; i <= 4; i++) {
        verticalPositions[i] = { x: xPosition, y: currentY }
        currentY += buttonHeight + equalSpacing
      }

      // 애니메이션으로 부드럽게 이동
      animateButtonPositions(verticalPositions, () => {
        // 세로 정렬 완료 후 자동으로 전송
        if (!isStudentMode) {
          setTimeout(() => {
            sendButtonPositions()
          }, 100)
        }
      })
      onAlignmentChange(true) // 부모에게 세로 정렬 상태 알림
    }
  }

  onMount(() => {
    // 컨테이너가 마운트된 후 위치 계산
    setTimeout(() => {
      if (containerElement) {
        const buttonWidth = 48
        const containerWidth = containerElement.offsetWidth
        const totalButtonWidth = 4 * buttonWidth
        const availableSpace = containerWidth - totalButtonWidth
        const spacing = availableSpace / 5 // 5개 구간으로 나누어 균등 분배

        const centerY = containerElement.offsetHeight / 2 - buttonWidth / 2 // 세로 중앙
        const positions = {
          1: { x: spacing, y: centerY },
          2: { x: spacing * 2 + buttonWidth, y: centerY },
          3: { x: spacing * 3 + buttonWidth * 2, y: centerY },
          4: { x: spacing * 4 + buttonWidth * 3, y: centerY },
        }
        initialPositions = positions
        buttonPositions = { ...positions }
      }
    }, 0)

    // 전역 마우스 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // 정렬 이벤트 리스너 추가
    const handleHorizontalAlign = () => resetToInitialPositions()
    const handleVerticalAlign = () => alignVertically()

    containerElement?.addEventListener('horizontalAlign', handleHorizontalAlign)
    containerElement?.addEventListener('verticalAlign', handleVerticalAlign)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      containerElement?.removeEventListener(
        'horizontalAlign',
        handleHorizontalAlign
      )
      containerElement?.removeEventListener(
        'verticalAlign',
        handleVerticalAlign
      )
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
    {#each [1, 2, 3, 4] as num}
      <div
        class="button-container"
        class:dragging={draggedButton === num}
        style="transform: translate({buttonPositions[num]
          .x}px, {buttonPositions[num].y}px);"
        onmousedown={(e) => handleContainerMouseDown(e, num)}
        role="button"
        tabindex="0"
      >
        <button
          class="number-button btn-{num}"
          class:selected={selected === num}
          class:disabled
          class:dragging={draggedButton === num}
          style="width: {buttonSize}px; height: {buttonSize}px; font-size: {buttonSize *
            0.6}px;"
          onclick={() => handleClick(num)}
          onmousedown={(e) => handleMouseDown(e, num)}
        >
          {num}
        </button>

        <!-- 편집 버튼 (관리자 모드에서만 표시) -->
        {#if !isStudentMode && !textElements.some((text) => text.numberId === num)}
          <button
            class="action-button edit-button"
            title="편집"
            aria-label="편집"
            onmousedown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onclick={(e) => {
              e.stopPropagation()
              editingNumber = num
              // 버튼 위치를 기준으로 텍스트 위치 계산
              const buttonX = buttonPositions[num].x
              const buttonY = buttonPositions[num].y
              clickPosition = {
                x: buttonX + buttonSize + 10, // 버튼 오른쪽에 10px 간격
                y: buttonY + buttonSize / 2 - 15, // 버튼 중앙 높이에 맞춤
              }
              // 다음 틱에서 입력상자에 포커스
              setTimeout(() => {
                if (inputElement) {
                  inputElement.focus()
                }
              }, 0)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M8 2l2 2-6 6H2V8l6-6z" />
            </svg>
          </button>
        {/if}

        <!-- 편집 입력상자 (관리자 모드에서만 표시) -->
        {#if !isStudentMode && editingNumber === num}
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
                    textElements = [
                      ...textElements,
                      {
                        id: textId,
                        text: editingText[num],
                        x: clickPosition.x,
                        y: clickPosition.y,
                        numberId: num,
                      },
                    ]
                    editingText[num] = ''
                    clickPosition = null
                  }
                  editingNumber = null
                  
                  // 텍스트 입력 완료 후 자동으로 전송
                  if (!isStudentMode) {
                    setTimeout(() => {
                      sendButtonPositions()
                    }, 100)
                  }
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

  <!-- 텍스트 요소들 (관리자 모드에서만 표시) -->
  {#if !isStudentMode}
    {#each textElements as textElement (textElement.id)}
      <div
        class="text-element"
        class:dragging={draggedTextId === textElement.id}
        style="position: absolute; left: {textElement.x}px; top: {textElement.y}px;"
        onmousedown={(e) => handleTextMouseDown(e, textElement.id)}
        role="button"
        tabindex="0"
      >
      <!-- 텍스트 수정 입력상자 -->
      {#if editingTextId === textElement.id}
        <div class="text-edit-input-container">
          <input
            bind:this={inputElement}
            class="text-edit-input"
            type="text"
            bind:value={editingText[textElement.numberId]}
            placeholder="텍스트 수정..."
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                if (editingText[textElement.numberId].trim()) {
                  textElements = textElements.map((t) =>
                    t.id === textElement.id
                      ? { ...t, text: editingText[textElement.numberId] }
                      : t
                  )
                  editingText[textElement.numberId] = ''
                }
                editingTextId = null
                
                // 텍스트 수정 완료 후 자동으로 전송
                if (!isStudentMode) {
                  setTimeout(() => {
                    sendButtonPositions()
                  }, 100)
                }
              } else if (e.key === 'Escape') {
                editingTextId = null
                editingText[textElement.numberId] = ''
              }
            }}
            onblur={() => {
              editingTextId = null
              editingText[textElement.numberId] = ''
            }}
            spellcheck="false"
          />
        </div>
      {:else}
        {textElement.text}
      {/if}

      <!-- 텍스트 액션 버튼들 -->
      <div class="text-action-buttons">
        <!-- 수정 버튼 -->
        <button
          class="text-action-button edit-text-button"
          title="수정"
          aria-label="수정"
          onclick={(e) => {
            e.stopPropagation()
            editingTextId = textElement.id
            editingText[textElement.numberId] = textElement.text
            setTimeout(() => {
              if (inputElement) {
                inputElement.focus()
              }
            }, 0)
          }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M8 2l2 2-6 6H2V8l6-6z" />
          </svg>
        </button>

        <!-- 삭제 버튼 -->
        <button
          class="text-action-button delete-text-button"
          title="삭제"
          aria-label="삭제"
          onclick={(e) => {
            e.stopPropagation()
            textElements = textElements.filter((t) => t.id !== textElement.id)
            
            // 텍스트 삭제 후 자동으로 전송
            if (!isStudentMode) {
              setTimeout(() => {
                sendButtonPositions()
              }, 100)
            }
          }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 2l8 8M10 2L2 10" />
          </svg>
        </button>
      </div>
    </div>
  {/each}
  {/if}

  <!-- 텍스트 요소들 (학생 모드에서도 표시, 읽기 전용) -->
  {#if isStudentMode}
    {#each textElements as textElement (textElement.id)}
      <div
        class="text-element student-text"
        style="position: absolute; left: {textElement.x}px; top: {textElement.y}px;"
      >
        {textElement.text}
      </div>
    {/each}
  {/if}
</div>

<style>
  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    min-height: 300px;
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
    min-height: 300px;
  }

  .button-container {
    position: absolute;
    z-index: 2;
  }

  .number-button {
    position: relative;
    border-radius: 50%;
    font-weight: normal;
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
    z-index: 20;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    opacity: 0;
    pointer-events: auto;
  }

  .button-container.dragging .action-button {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .button-container:hover .action-button {
    opacity: 1;
  }

  .button-container.dragging:hover .action-button {
    opacity: 0 !important;
    pointer-events: none !important;
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
    background: none;
    border: none;
    border-bottom: 2px solid #ffffff;
    color: #ffffff;
    padding: 8px 12px;
    font-size: 28px;
    border-radius: 0;
    min-width: 200px;
    outline: none;
  }

  .edit-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 300;
    font-size: 28px;
  }

  .edit-input:focus {
    border-bottom-color: #3b82f6;
  }

  .text-element {
    position: absolute;
    background: none;
    color: #6b7280;
    padding: 0;
    border-radius: 0;
    font-size: 28px;
    cursor: grab;
    user-select: none;
    z-index: 5;
    border: none;
  }

  .text-element.student-text {
    cursor: default;
    color: #6b7280;
    font-weight: 500;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .text-element:active {
    cursor: grabbing;
  }

  .text-element.student-text:active {
    cursor: default;
  }

  .text-element.dragging {
    z-index: 1000;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
    transform: scale(1.05);
    filter: brightness(1.3) contrast(1.2);
  }

  .text-action-buttons {
    position: absolute;
    top: -8px;
    right: -8px;
    display: flex;
    gap: 2px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .text-element:hover .text-action-buttons {
    opacity: 1;
    pointer-events: auto;
  }

  .text-action-button {
    width: 16px;
    height: 16px;
    background: rgba(107, 114, 128, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6px;
    transition: all 0.2s ease;
    z-index: 15;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .text-action-button:hover {
    background: rgba(59, 130, 246, 0.9);
    transform: scale(1.1);
  }

  .text-action-button:active {
    transform: scale(0.95);
  }

  .delete-text-button:hover {
    background: rgba(239, 68, 68, 0.9);
  }

  .text-action-button svg {
    stroke: currentColor;
    stroke-width: 1.5;
    fill: none;
  }

  .text-edit-input-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
  }

  .text-edit-input {
    background: none;
    border: none;
    color: #6b7280;
    padding: 0;
    font-size: 28px;
    min-width: 200px;
    outline: none;
    width: 100%;
    height: 100%;
  }

  .text-edit-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 300;
    font-size: 28px;
  }

  .text-edit-input:focus {
    border-bottom-color: #3b82f6;
  }

  .number-button.dragging {
    z-index: 1000;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    transition: none; /* 드래그 중에는 transition 제거 */
    transform: scale(1.1);
    filter: brightness(1.2) contrast(1.1);
  }

  .number-button:active {
    cursor: grabbing;
  }

  .btn-1 {
    background: none;
    border: 2px solid #6b7280;
    color: #6b7280;
  }
  .btn-1:hover {
    background: #6b7280;
    color: white;
  }
  .btn-2 {
    background: none;
    border: 2px solid #6b7280;
    color: #6b7280;
  }
  .btn-2:hover {
    background: #6b7280;
    color: white;
  }
  .btn-3 {
    background: none;
    border: 2px solid #6b7280;
    color: #6b7280;
  }
  .btn-3:hover {
    background: #6b7280;
    color: white;
  }
  .btn-4 {
    background: none;
    border: 2px solid #6b7280;
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
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
    .alignment-button {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }
</style>
