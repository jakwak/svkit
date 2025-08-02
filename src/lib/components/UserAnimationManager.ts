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

    // 리사이즈 이벤트 리스너 추가
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

  private updateArrivalOrder(username: string) {
    if (!this.arrivalOrder[username]) {
      this.arrivalOrder[username] = this.nextArrivalIndex++
    }
  }

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
    if (!this.isReady()) return

    // GSAP으로 DOM 요소들을 가져오기
    const numberButtons = gsap.utils.toArray('.number-button') as HTMLElement[]
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    
    if (numberButtons.length === 0 || userButtons.length === 0) return

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
      if (!element) return

      const user = users[index]
      if (!user) return

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
          delay: index * 0.05
        })
        return
      }

      // answer_number에 해당하는 숫자 버튼 찾기 (1-4)
      const targetNumberIndex = answerNumber - 1
      if (targetNumberIndex < 0 || targetNumberIndex >= numberButtons.length) return

      const targetButton = numberButtons[targetNumberIndex]
      if (!targetButton) return

      const targetRect = targetButton.getBoundingClientRect()

      // 같은 답변을 선택한 사용자들을 도착 순서대로 정렬
      const sameAnswerUsers = this.getSortedUsersByAnswer(users, answerNumber)
      const userOrder = sameAnswerUsers.findIndex(
        (item) => item.user.username === user.username
      )

      if (userOrder === -1) return

      const buttonWidth = element.offsetWidth || 80
      const buttonHeight = element.offsetHeight || 40
      const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
      
      const numberButtonWidth = targetRect.width
      const userButtonWidth = buttonWidth
      const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
      const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
      
      const numberButtonHeight = targetRect.height
      const startY = targetRect.bottom - pageRect.top + 5

      const scaledButtonHeight = buttonHeight * BUTTON_CONSTANTS.SCALE_FACTOR
      const targetY = startY + userOrder * (scaledButtonHeight + spacing)

      const originalPos = this.originalPositions[index]
      if (!originalPos) return

      const moveX = targetCenterX - originalPos.x
      const moveY = targetY - originalPos.y

      gsap.to(element, {
        x: moveX,
        y: moveY,
        scale: BUTTON_CONSTANTS.SCALE_FACTOR,
        opacity: 0.9,
        duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
        ease: 'power2.out',
        delay: 0
      })
    })
  }

  moveSingleUserToNumber(
    users: User[],
    userIndex: number,
    targetNumber: number
  ) {
    if (!this.isReady()) return

    // GSAP으로 DOM 요소들을 가져오기
    const numberButtons = gsap.utils.toArray('.number-button') as HTMLElement[]
    const userButtons = gsap.utils.toArray('.user-button-container') as HTMLElement[]
    const pageRect = document.body.getBoundingClientRect()

    const targetButton = numberButtons[targetNumber - 1]
    if (!targetButton) return

    const targetRect = targetButton.getBoundingClientRect()
    const userButton = userButtons[userIndex]
    if (!userButton) return

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

    if (userOrder === -1) return

    const buttonWidth = userButton.offsetWidth || 80
    const buttonHeight = userButton.offsetHeight || 40
    const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
    
    let targetCenterX: number
    let startY: number
    
    if (this.isVerticalAlignment) {
      if (userOrder === 0) {
        const numberButtonWidth = targetRect.width
        const userButtonWidth = buttonWidth
        const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
        targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
        
        const numberButtonHeight = targetRect.height
        startY = targetRect.bottom - pageRect.top + 5
      } else {
        targetCenterX = targetRect.right - pageRect.left + 10
        startY = targetRect.top - pageRect.top + targetRect.height / 2 - buttonHeight / 2
      }
    } else {
      const numberButtonWidth = targetRect.width
      const userButtonWidth = buttonWidth
      const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
      targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
      
      const numberButtonHeight = targetRect.height
      startY = targetRect.bottom - pageRect.top + 5
    }

    let targetX: number
    let targetY: number
    
    if (this.isVerticalAlignment) {
      if (userOrder === 0) {
        // 첫 번째 사용자: 숫자버튼 아래 중앙 정렬
        targetX = targetCenterX
        targetY = startY
      } else {
        // 나머지 사용자: 첫 번째 사용자버튼의 오른쪽으로 정렬
        const firstUserButton = userButtons[sameAnswerUsers[0].originalIndex]
        if (firstUserButton) {
          const firstUserRect = firstUserButton.getBoundingClientRect()
          const firstUserRight = firstUserRect.right - pageRect.left
          const scaledButtonWidth = buttonWidth * BUTTON_CONSTANTS.SCALE_FACTOR
          targetX = firstUserRight + (userOrder - 1) * (scaledButtonWidth + BUTTON_CONSTANTS.HORIZONTAL_SPACING)
          targetY = startY // 첫 번째 사용자와 같은 Y좌표 사용
        } else {
          // 첫 번째 사용자버튼이 없는 경우 기본 위치
          const scaledButtonWidth = buttonWidth * BUTTON_CONSTANTS.SCALE_FACTOR
          targetX = targetCenterX + userOrder * (scaledButtonWidth + BUTTON_CONSTANTS.HORIZONTAL_SPACING)
          targetY = startY
        }
      }
    } else {
      const scaledButtonHeight = buttonHeight * BUTTON_CONSTANTS.SCALE_FACTOR
      targetX = targetCenterX
      targetY = startY + userOrder * (scaledButtonHeight + spacing)
    }

    // 원래 위치에서 목표 위치까지의 이동 거리 계산
    const originalPos = this.originalPositions[userIndex]
    const moveX = targetX - originalPos.x
    const moveY = targetY - originalPos.y

    const animation = gsap.to(userButton, {
      x: moveX,
      y: moveY,
      scale: BUTTON_CONSTANTS.SCALE_FACTOR,
      opacity: 0.9,
      zIndex: this.currentZIndex++,
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

        const buttonHeight = userButton.offsetHeight || 40
        const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
        const buttonWidth = userButton.offsetWidth || 80

        let targetX: number
        let targetY: number

        if (this.isVerticalAlignment) {
          // 세로정렬일 때 공통 Y좌표 계산
          const numberButtonHeight = targetRect.height
          const startY = targetRect.bottom - pageRect.top + 5
          
          if (index === 0) {
            // 첫 번째 사용자: 숫자버튼 아래 중앙 정렬
            const numberButtonWidth = targetRect.width
            const userButtonWidth = buttonWidth
            const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
            const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
            
            targetX = targetCenterX
            targetY = startY
          } else {
            // 나머지 사용자: 첫 번째 사용자버튼의 오른쪽으로 정렬
            const firstUserButton = userButtons[sameAnswerUsers[0].originalIndex]
            if (firstUserButton) {
              const firstUserRect = firstUserButton.getBoundingClientRect()
              const firstUserRight = firstUserRect.right - pageRect.left
              const scaledButtonWidth = buttonWidth * BUTTON_CONSTANTS.SCALE_FACTOR
              targetX = firstUserRight + (index - 1) * (scaledButtonWidth + BUTTON_CONSTANTS.HORIZONTAL_SPACING)
              targetY = startY // 첫 번째 사용자와 같은 Y좌표 사용
            } else {
              // 첫 번째 사용자버튼이 없는 경우 기본 위치
              const startX = targetRect.right - pageRect.left + 10
              const scaledButtonWidth = buttonWidth * BUTTON_CONSTANTS.SCALE_FACTOR
              targetX = startX + (index - 1) * (scaledButtonWidth + BUTTON_CONSTANTS.HORIZONTAL_SPACING)
              targetY = startY // 첫 번째 사용자와 같은 Y좌표 사용
            }
          }
        } else {
          const numberButtonWidth = targetRect.width
          const userButtonWidth = buttonWidth
          const numberButtonCenterX = targetRect.left + numberButtonWidth / 2
          const targetCenterX = numberButtonCenterX - pageRect.left - userButtonWidth / 2
          
          const numberButtonHeight = targetRect.height
          const startY = targetRect.bottom - pageRect.top + 5
          targetX = targetCenterX
          const scaledButtonHeight = buttonHeight * BUTTON_CONSTANTS.SCALE_FACTOR
          targetY = startY + index * (scaledButtonHeight + spacing)
        }

        // 원래 위치에서 목표 위치까지의 이동 거리 계산
        const originalPos = this.originalPositions[userIndex]
        const moveX = targetX - originalPos.x
        const moveY = targetY - originalPos.y

        gsap.to(userButton, {
          x: moveX,
          y: moveY,
          scale: BUTTON_CONSTANTS.SCALE_FACTOR,
          opacity: 0.9,
          zIndex: this.currentZIndex++,
          duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
          ease: 'power2.out',
          delay: 0
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
