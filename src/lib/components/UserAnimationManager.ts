import { gsap } from 'gsap'
import {
  ANIMATION_CONSTANTS,
  Z_INDEX_CONSTANTS,
  BUTTON_CONSTANTS,
} from '$lib/globals'

export interface OriginalPosition {
  x: number
  y: number
}

export class UserAnimationManager {
  private originalPositions: OriginalPosition[] = []
  private isInitialized = false
  private arrivalOrder: { [username: string]: number } = {} // 도착 순서 추적
  private nextArrivalIndex = 0 // 다음 도착 인덱스
  private currentZIndex = Z_INDEX_CONSTANTS.ANIMATION_Z_INDEX // 현재 사용 중인 z-index 값
  private resizeListener: (() => void) | null = null
  private resizeTimeout: number | null = null
  private activeAnimations: { [userIndex: number]: gsap.core.Tween } = {} // 진행 중인 애니메이션 추적
  private isVerticalAlignment = false // 세로 정렬 상태

  initialize(originalPositions: OriginalPosition[]) {
    this.originalPositions = originalPositions
    this.isInitialized = true
    this.currentZIndex = 10 // z-index 초기화

    // 모든 사용자 버튼의 초기 transform 설정
    gsap.set('.user-button-container', {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: 'center center'
    })

    // 리사이즈 이벤트 리스너 추가 (디바운싱 적용)
    this.resizeListener = () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }
      this.resizeTimeout = window.setTimeout(() => {
        // 리사이즈 처리는 UserButtons 컴포넌트에서 처리
      }, ANIMATION_CONSTANTS.DEBOUNCE_DELAY)
    }
    window.addEventListener('resize', this.resizeListener)
  }

  isReady(): boolean {
    return this.isInitialized && this.originalPositions.length > 0
  }

  setVerticalAlignment(isVertical: boolean) {
    this.isVerticalAlignment = isVertical
  }

  // 도착 순서를 정확히 추적하는 헬퍼 메서드
  private updateArrivalOrder(username: string) {
    if (!this.arrivalOrder[username]) {
      this.arrivalOrder[username] = this.nextArrivalIndex++
    }
  }

  // 같은 답변을 선택한 사용자들을 도착 순서대로 정렬하는 헬퍼 메서드
  private getSortedUsersByAnswer(users: User[], answerNumber: number): Array<{ user: User; originalIndex: number }> {
    return users
      .map((user, index) => ({ user, originalIndex: index }))
      .filter(({ user }) => {
        // answer_number 또는 answerNumber 속성 확인
        const userAnswer = (user as any).answer_number ?? (user as any).answerNumber ?? 0
        return userAnswer === answerNumber
      })
      .sort((a, b) => {
        const orderA = this.arrivalOrder[a.user.username] || 0
        const orderB = this.arrivalOrder[b.user.username] || 0
        return orderA - orderB // 먼저 도착한 것이 위에
      })
  }

  moveUsersToAnswerNumbers(users: User[]) {
    if (!this.isReady()) {
      console.warn('UserAnimationManager is not ready')
      return
    }

    // GSAP으로 DOM 요소들을 가져오기
    const numberButtons = gsap.utils.toArray('.number-button') as HTMLElement[]
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    
    if (numberButtons.length === 0) {
      console.warn('No number buttons found')
      return
    }
    
    if (userButtons.length === 0) {
      console.warn('No user buttons found')
      return
    }

    const pageRect = document.body.getBoundingClientRect()

    // 각 사용자의 도착 순서 기록
    users.forEach((user) => {
      // answer_number 또는 answerNumber 속성 확인
      const answerNumber = (user as any).answer_number ?? (user as any).answerNumber ?? 0
      if (answerNumber > 0 && answerNumber <= 4) {
        this.updateArrivalOrder(user.username)
      }
    })

    userButtons.forEach((element, index) => {
      if (!element) {
        console.warn(`User button element not found at index ${index}`)
        return
      }

      const user = users[index]
      if (!user) {
        console.warn(`User not found at index ${index}`)
        return
      }

      // answer_number 또는 answerNumber 속성 확인
      const answerNumber = (user as any).answer_number ?? (user as any).answerNumber ?? 0
      if (answerNumber === 0) {
        // answer_number가 0이면 원래 위치로
        
        // 즉시 원래 위치로 설정
        gsap.set(element, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1
        })
        
        // 부드러운 애니메이션으로 이동
        gsap.to(element, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.05,
          onStart: () => {
          },
          onComplete: () => {
          }
        })
        return
      }

      // answer_number에 해당하는 숫자 버튼 찾기 (1-4)
      const targetNumberIndex = answerNumber - 1
      if (targetNumberIndex < 0 || targetNumberIndex >= numberButtons.length) {
        console.warn(`Invalid target number index: ${targetNumberIndex}`)
        return
      }

      const targetButton = numberButtons[targetNumberIndex]
      if (!targetButton) {
        console.warn(`Target button not found for number ${answerNumber}`)
        return
      }

      const targetRect = targetButton.getBoundingClientRect()

      // 같은 답변을 선택한 사용자들을 도착 순서대로 정렬
      const sameAnswerUsers = this.getSortedUsersByAnswer(users, answerNumber)
      const userOrder = sameAnswerUsers.findIndex(
        (item) => item.user.username === user.username
      )

      if (userOrder === -1) {
        console.warn(`User order not found for ${user.username}`)
        return
      }

      // 숫자 버튼 바로 아래 세로 일렬 가운데 정렬 (실제 DOM 크기 사용)
      const buttonWidth = element.offsetWidth || 80 // 실제 DOM 크기 사용
      const buttonHeight = element.offsetHeight || 40 // 실제 DOM 크기 사용
      const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
      
      // 숫자 버튼과 사용자 버튼의 실제 크기를 감안한 정확한 가운데 정렬
      const numberButtonWidth = targetRect.width
      const userButtonWidth = buttonWidth
      const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
      const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
      
      // 숫자 버튼의 실제 높이를 계산하여 겹치지 않도록 함
      const numberButtonHeight = targetRect.height
      const startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 아래에서 5px 간격으로 겹치지 않도록

      // 단순히 순서대로 세로로 배치 (scale 적용된 크기로 계산)
      const targetY = startY + userOrder * (buttonHeight + spacing)

      // 원래 위치에서 목표 위치까지의 이동 거리 계산
      const originalPos = this.originalPositions[index]
      if (!originalPos) {
        console.warn(`Original position not found for index ${index}`)
        return
      }

      const moveX = targetCenterX - originalPos.x
      const moveY = targetY - originalPos.y

      // 현재 위치 확인
      const currentTransform = gsap.getProperty(element, "x") || 0
      const currentY = gsap.getProperty(element, "y") || 0

      // 먼저 현재 상태를 설정
      gsap.set(element, {
        scale: 0.75,
        opacity: 0.9,
        zIndex: this.currentZIndex++
      })

      // 애니메이션 실행
      gsap.to(element, {
        x: moveX,
        y: moveY,
        scale: 0.75,
        opacity: 0.9,
        duration: 1.0, // 더 긴 duration으로 확실히 보이게
        ease: 'power2.out',
        delay: 0,
        onStart: () => {
        },
        onComplete: () => {
        },
        onError: (error: any) => {
          console.error(`Animation error for user ${user.username}:`, error)
        }
      })
    })
  }

  moveSingleUserToNumber(
    users: User[],
    userIndex: number,
    targetNumber: number
  ) {
    
    if (!this.isReady()) {
      console.warn('UserAnimationManager is not ready')
      return
    }

    // GSAP으로 DOM 요소들을 가져오기
    const numberButtons = gsap.utils.toArray('.number-button') as HTMLElement[]
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    const pageRect = document.body.getBoundingClientRect()

    const targetButton = numberButtons[targetNumber - 1]
    if (!targetButton) {
      console.warn(`Target button not found for number ${targetNumber}`)
      return
    }

    const targetRect = targetButton.getBoundingClientRect()
    const userButton = userButtons[userIndex]
    if (!userButton) {
      console.warn(`User button not found at index ${userIndex}`)
      return
    }

    // 현재 진행 중인 애니메이션이 있다면 취소
    const existingAnimation = this.activeAnimations[userIndex]
    if (existingAnimation) {
      existingAnimation.kill()
      delete this.activeAnimations[userIndex]
    }

    // 현재 사용자의 도착 순서 기록 (항상 새로운 순서로 업데이트)
    const currentUser = users[userIndex]
    this.updateArrivalOrder(currentUser.username)

    // 도착 순서대로 정렬
    const sameAnswerUsers = this.getSortedUsersByAnswer(users, targetNumber)
    const userOrder = sameAnswerUsers.findIndex(
      (item) => item.user.username === currentUser.username
    )

    if (userOrder === -1) {
      console.warn('User order not found')
      return
    }

    // 숫자 버튼 바로 아래로 이동 (중앙 정렬) - 실제 DOM 크기 사용
    const buttonWidth = userButton.offsetWidth || 80 // 실제 DOM 크기 사용
    const buttonHeight = userButton.offsetHeight || 40 // 실제 DOM 크기 사용
    const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
    
    let targetCenterX: number
    let startY: number
    
    if (this.isVerticalAlignment) {
      // 세로 정렬일 때: 첫 번째 버튼은 숫자 버튼 아래, 나머지는 오른쪽으로 가로 정렬
      if (userOrder === 0) {
        // 첫 번째 버튼: 숫자 버튼 아래 중앙 정렬
        const numberButtonWidth = targetRect.width
        const userButtonWidth = buttonWidth
        const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
        targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
        
        // 숫자 버튼의 실제 높이를 계산하여 겹치지 않도록 함
        const numberButtonHeight = targetRect.height
        startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 아래에서 5px 간격
      } else {
        // 나머지 버튼: 숫자 버튼 오른쪽으로 가로 정렬
        targetCenterX = targetRect.right - pageRect.left + 10 // 숫자 버튼 오른쪽에서 10px 간격
        startY = targetRect.top - pageRect.top + targetRect.height / 2 - buttonHeight / 2 // 숫자 버튼 세로 중앙
      }
    } else {
      // 가로 정렬일 때: 숫자 버튼 아래로 세로 정렬
      // 숫자 버튼과 사용자 버튼의 실제 크기를 감안한 정확한 가운데 정렬
      const numberButtonWidth = targetRect.width
      const userButtonWidth = buttonWidth
      const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
      targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
      
      // 숫자 버튼의 실제 높이를 계산하여 겹치지 않도록 함
      const numberButtonHeight = targetRect.height
      startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 아래에서 5px 간격으로 겹치지 않도록
    }

    // 순서대로 배치
    let targetX: number
    let targetY: number
    
    if (this.isVerticalAlignment) {
      // 세로 정렬일 때: 가로로 배치
      targetX = targetCenterX + userOrder * (buttonWidth + spacing)
      targetY = startY
    } else {
      // 가로 정렬일 때: 세로로 배치
      targetX = targetCenterX
      targetY = startY + userOrder * (buttonHeight + spacing)
    }

    // 원래 위치에서 목표 위치까지의 이동 거리 계산
    const originalPos = this.originalPositions[userIndex]
    const moveX = targetX - originalPos.x
    const moveY = targetY - originalPos.y

    const animation = gsap.to(userButton, {
      x: moveX,
      y: moveY,
      scale: 0.75, // 크기를 0.75배로 줄임
      opacity: 0.9,
      zIndex: this.currentZIndex++,
      duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
      ease: 'power2.out',
      onStart: () => {
      },
      onComplete: () => {
        delete this.activeAnimations[userIndex]
        // 이동 완료 후 자동으로 rearrange 실행
        this.rearrangeUsersAfterMove(users)
      },
    })

    // 진행 중인 애니메이션 추적
    this.activeAnimations[userIndex] = animation
  }

  moveSingleUserToOriginal(users: User[], userIndex: number) {
    if (!this.isReady()) return

    // GSAP으로 DOM 요소들을 가져오기
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    const userButton = userButtons[userIndex]
    if (!userButton) return

    // 현재 진행 중인 애니메이션이 있다면 취소
    const existingAnimation = this.activeAnimations[userIndex]
    if (existingAnimation) {
      existingAnimation.kill()
      delete this.activeAnimations[userIndex]
    }

    const animation = gsap.to(userButton, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: Z_INDEX_CONSTANTS.BASE_Z_INDEX,
      duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
      ease: 'power2.out',
      onComplete: () => {
        delete this.activeAnimations[userIndex]
        this.rearrangeUsersAfterMove(users)
      },
    })

    // 진행 중인 애니메이션 추적
    this.activeAnimations[userIndex] = animation
  }

  rearrangeUsersAfterMove(users: User[]) {
    if (!this.isReady()) return

    // GSAP으로 DOM 요소들을 가져오기
    const numberButtons = gsap.utils.toArray('.number-button') as HTMLElement[]
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    const pageRect = document.body.getBoundingClientRect()

    // 각 숫자 버튼별로 사용자들을 재배치
    for (let numberIndex = 1; numberIndex <= 4; numberIndex++) {
      const targetButton = numberButtons[numberIndex - 1]
      if (!targetButton) continue

      const targetRect = targetButton.getBoundingClientRect()
      
      // 도착 순서대로 정렬
      const sameAnswerUsers = this.getSortedUsersByAnswer(users, numberIndex)

      if (sameAnswerUsers.length === 0) continue

      // 도착 순서대로 배치
      sameAnswerUsers.forEach((item, index) => {
        const userIndex = item.originalIndex
        const userButton = userButtons[userIndex]
        if (!userButton) return

        // 실제 버튼 높이와 간격 계산 (실제 DOM 크기 사용)
        const buttonHeight = userButton.offsetHeight || 40 // 실제 DOM 크기 사용
        const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
        const buttonWidth = userButton.offsetWidth || 80 // 실제 DOM 크기 사용

        let targetX: number
        let targetY: number

        if (this.isVerticalAlignment) {
          // 세로 정렬일 때: 첫 번째 버튼은 숫자 버튼 아래, 나머지는 오른쪽으로 가로 정렬
          if (index === 0) {
            // 첫 번째 버튼: 숫자 버튼 아래 중앙 정렬
            const numberButtonWidth = targetRect.width
            const userButtonWidth = buttonWidth
            const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
            const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
            
            // 숫자 버튼의 실제 높이를 계산하여 겹치지 않도록 함
            const numberButtonHeight = targetRect.height
            const startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 아래에서 5px 간격
            targetX = targetCenterX
            targetY = startY
          } else {
            // 나머지 버튼: 숫자 버튼 오른쪽으로 가로 정렬
            const startX = targetRect.right - pageRect.left + 10 // 숫자 버튼 오른쪽에서 10px 간격
            const centerY = targetRect.top - pageRect.top + targetRect.height / 2 - buttonHeight / 2 // 숫자 버튼 세로 중앙
            targetX = startX + (index - 1) * (buttonWidth + spacing) // 첫 번째 버튼을 제외하고 계산
            targetY = centerY
          }
        } else {
          // 가로 정렬일 때: 숫자 버튼 아래로 세로 정렬
          // 숫자 버튼과 사용자 버튼의 실제 크기를 감안한 정확한 가운데 정렬
          const numberButtonWidth = targetRect.width
          const userButtonWidth = buttonWidth
          const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
          const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
          
          // 숫자 버튼의 실제 높이를 계산하여 겹치지 않도록 함
          const numberButtonHeight = targetRect.height
          const startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 아래에서 5px 간격으로 겹치지 않도록
          targetX = targetCenterX
          targetY = startY + index * (buttonHeight + spacing)
        }

        // 원래 위치에서 목표 위치까지의 이동 거리 계산
        const originalPos = this.originalPositions[userIndex]
        const moveX = targetX - originalPos.x
        const moveY = targetY - originalPos.y

        gsap.to(userButton, {
          x: moveX,
          y: moveY,
          scale: 0.75, // 크기를 0.75배로 줄임
          opacity: 0.9,
          zIndex: this.currentZIndex++,
          duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
          ease: 'power2.out',
          delay: 0, // delay 제거하여 동시 애니메이션
        })
      })
    }
  }

  resetAnimation() {
    // 모든 버튼을 원래 위치로
    const elements = gsap.utils.toArray('.user-button-container')
    if (elements.length === 0) {
      return
    }

    // 도착 순서 리셋
    this.arrivalOrder = {}
    this.nextArrivalIndex = 0
    this.currentZIndex = Z_INDEX_CONSTANTS.ANIMATION_Z_INDEX // z-index 리셋

    gsap.to('.user-button-container', {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: Z_INDEX_CONSTANTS.BASE_Z_INDEX,
      duration: ANIMATION_CONSTANTS.RESET_DURATION / 1000,
      ease: 'power2.out',
    })
  }

  resetArrivalOrder() {
    // 도착 순서만 리셋 (애니메이션 없이)
    this.arrivalOrder = {}
    this.nextArrivalIndex = 0
    this.currentZIndex = Z_INDEX_CONSTANTS.ANIMATION_Z_INDEX
  }

  removeUserFromArrivalOrder(username: string) {
    // 특정 사용자를 도착 순서에서 제거
    if (this.arrivalOrder[username]) {
      delete this.arrivalOrder[username]
    }
  }

  fadeInButtons() {
    // fade-in 애니메이션 (제자리에서 나타남)
    gsap.to('.user-button-container', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: ANIMATION_CONSTANTS.FADE_IN_DURATION / 1000,
      ease: 'power2.out',
      stagger: 0.1,
    })
  }

  saveOriginalPositions(): OriginalPosition[] {
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    const pageRect = document.body.getBoundingClientRect()
    const positions: OriginalPosition[] = []

    userButtons.forEach((element) => {
      const rect = element.getBoundingClientRect()
      positions.push({
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
      })
    })

    return positions
  }

  // 리사이즈 후 완전히 새로운 상태로 시작하는 메서드
  resetAfterResize() {
    // 모든 상태 초기화
    this.arrivalOrder = {}
    this.nextArrivalIndex = 0
    this.currentZIndex = Z_INDEX_CONSTANTS.ANIMATION_Z_INDEX
    this.isInitialized = false

    // 새로운 위치 저장 및 초기화
    const newPositions = this.saveOriginalPositions()
    this.initialize(newPositions)
  }

  destroy() {
    // 리사이즈 이벤트 리스너 제거
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener)
      this.resizeListener = null
    }

    // 타임아웃 정리
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = null
    }
  }
}
