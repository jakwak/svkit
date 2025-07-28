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

  initialize(originalPositions: OriginalPosition[]) {
    this.originalPositions = originalPositions
    this.isInitialized = true
    this.currentZIndex = 10 // z-index 초기화

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

  moveUsersToAnswerNumbers(users: User[]) {
    if (!this.isReady()) return

    const numberButtons = document.querySelectorAll('.number-button')
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()

    // 각 사용자의 도착 순서 기록
    users.forEach((user) => {
      const answerNumber = user.answer_number ?? 0
      if (
        answerNumber > 0 &&
        answerNumber <= 4 &&
        !this.arrivalOrder[user.username]
      ) {
        this.arrivalOrder[user.username] = this.nextArrivalIndex++
      }
    })

    // 각 숫자 버튼별로 사용자들을 그룹화
    const usersByAnswer: {
      [key: number]: Array<{ user: User; originalIndex: number }>
    } = {}

    users.forEach((user, index) => {
      const answerNumber = user.answer_number ?? 0
      if (answerNumber > 0 && answerNumber <= 4) {
        if (!usersByAnswer[answerNumber]) {
          usersByAnswer[answerNumber] = []
        }
        usersByAnswer[answerNumber].push({ user, originalIndex: index })
      }
    })

    userButtons.forEach((button, index) => {
      const element = button as HTMLElement
      if (!element) return

      const user = users[index]
      const answerNumber = user?.answer_number ?? 0
      if (!user || answerNumber === 0) {
        // answer_number가 0이면 원래 위치로
        gsap.to(element, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.05,
        })
        return
      }

      // answer_number에 해당하는 숫자 버튼 찾기 (1-4)
      const targetNumberIndex = answerNumber - 1
      if (targetNumberIndex < 0 || targetNumberIndex >= numberButtons.length)
        return

      const targetButton = numberButtons[targetNumberIndex] as HTMLElement
      if (!targetButton) return

      const targetRect = targetButton.getBoundingClientRect()

      // 같은 답변을 선택한 사용자들을 도착 순서대로 정렬
      const sameAnswerUsers = users
        .filter((u) => (u.answer_number ?? 0) === answerNumber)
        .sort((a, b) => {
          const orderA = this.arrivalOrder[a.username] || 0
          const orderB = this.arrivalOrder[b.username] || 0
          return orderA - orderB // 먼저 도착한 것이 위에
        })

      const userOrder = sameAnswerUsers.findIndex(
        (u) => u.username === user.username
      )

      // 숫자 버튼 바로 아래 세로 일렬 가운데 정렬 (실제 DOM 크기 사용)
      const buttonWidth = (element.offsetWidth || 80) * BUTTON_CONSTANTS.SCALE_FACTOR
      const targetCenterX =
        targetRect.left + targetRect.width / 2 - pageRect.left - buttonWidth / 2
      const buttonHeight = (element.offsetHeight || 40) * BUTTON_CONSTANTS.SCALE_FACTOR
      const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
      const startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 바로 아래 5px

      // 단순히 순서대로 세로로 배치 (scale 적용된 크기로 계산)
      const targetY = startY + userOrder * (buttonHeight + spacing)

      // 원래 위치에서 목표 위치까지의 이동 거리 계산
      const originalPos = this.originalPositions[index]
      const moveX = targetCenterX - originalPos.x
      const moveY = targetY - originalPos.y

      gsap.to(element, {
        x: moveX,
        y: moveY,
        scale: BUTTON_CONSTANTS.SCALE_FACTOR,
        opacity: 0.9,
        zIndex: this.currentZIndex++,
        duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
        ease: 'power2.out',
        delay: 0, // delay 제거하여 동시 애니메이션
      })
    })
  }

  moveSingleUserToNumber(
    users: User[],
    userIndex: number,
    targetNumber: number
  ) {
    if (!this.isReady()) return

    const numberButtons = document.querySelectorAll('.number-button')
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()

    const targetButton = numberButtons[targetNumber - 1] as HTMLElement
    if (!targetButton) return

    const targetRect = targetButton.getBoundingClientRect()
    const userButton = userButtons[userIndex] as HTMLElement
    if (!userButton) return

    // 현재 사용자의 도착 순서 기록 (항상 새로운 순서로 업데이트)
    const currentUser = users[userIndex]
    this.arrivalOrder[currentUser.username] = this.nextArrivalIndex++

    // 숫자 버튼 바로 아래로 이동 (중앙 정렬) - 실제 DOM 크기 사용
    const buttonWidth = (userButton.offsetWidth || 80) * BUTTON_CONSTANTS.SCALE_FACTOR
    // 숫자 버튼의 정확한 중앙 위치 계산
    const targetCenterX =
      targetRect.left + targetRect.width / 2 - pageRect.left - buttonWidth / 2
    const buttonHeight = (userButton.offsetHeight || 40) * BUTTON_CONSTANTS.SCALE_FACTOR
    const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
    const startY = targetRect.bottom - pageRect.top + 5

    // 도착 순서대로 정렬
    const sameAnswerUsers = users
      .filter((user) => (user.answer_number ?? 0) === targetNumber)
      .sort((a, b) => {
        const orderA = this.arrivalOrder[a.username] || 0
        const orderB = this.arrivalOrder[b.username] || 0
        return orderA - orderB // 먼저 도착한 것이 위에
      })

    // 현재 사용자의 순서 찾기
    const userOrder = sameAnswerUsers.findIndex(
      (user) => user.username === currentUser.username
    )

    // 순서대로 배치
    const targetY = startY + userOrder * (buttonHeight + spacing)

    // 원래 위치에서 목표 위치까지의 이동 거리 계산
    const originalPos = this.originalPositions[userIndex]
    const moveX = targetCenterX - originalPos.x
    const moveY = targetY - originalPos.y

    gsap.to(userButton, {
      x: moveX,
      y: moveY,
      scale: BUTTON_CONSTANTS.SCALE_FACTOR,
      opacity: 0.9,
      zIndex: this.currentZIndex++,
      duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
      ease: 'power2.out',
      onComplete: () => {
        // 이동 완료 후 자동으로 rearrange 실행
        this.rearrangeUsersAfterMove(users)
      },
    })
  }

  moveSingleUserToOriginal(
    users: User[],
    userIndex: number,
    onComplete?: () => void
  ) {
    if (!this.isReady()) return

    const userButtons = document.querySelectorAll('.user-button-container')
    const userButton = userButtons[userIndex] as HTMLElement
    if (!userButton) return

    gsap.to(userButton, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: Z_INDEX_CONSTANTS.BASE_Z_INDEX,
      duration: ANIMATION_CONSTANTS.MOVE_DURATION / 1000,
      ease: 'power2.out',
      onComplete,
    })
  }

  rearrangeUsersAfterMove(users: User[]) {
    if (!this.isReady()) return

    const numberButtons = document.querySelectorAll('.number-button')
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()

    // 각 숫자 버튼별로 사용자들을 재배치
    for (let numberIndex = 1; numberIndex <= 4; numberIndex++) {
      const targetButton = numberButtons[numberIndex - 1] as HTMLElement
      if (!targetButton) continue

      const targetRect = targetButton.getBoundingClientRect()
      // 도착 순서대로 정렬
      const sameAnswerUsers = users
        .filter((user) => (user.answer_number ?? 0) === numberIndex)
        .sort((a, b) => {
          const orderA = this.arrivalOrder[a.username] || 0
          const orderB = this.arrivalOrder[b.username] || 0
          return orderA - orderB // 먼저 도착한 것이 위에
        })

      if (sameAnswerUsers.length === 0) continue

      // 숫자 버튼 바로 아래로 재배치
      const startY = targetRect.bottom - pageRect.top + 5

      // 도착 순서대로 배치 (username 기준 정렬 제거)
      sameAnswerUsers.forEach((user, index) => {
        const userIndex = users.findIndex((u) => u.username === user.username)
        if (userIndex === -1) return

        const userButton = userButtons[userIndex] as HTMLElement
        if (!userButton) return

        // 실제 버튼 높이와 간격 계산 (실제 DOM 크기 사용)
        const buttonHeight = (userButton.offsetHeight || 40) * BUTTON_CONSTANTS.SCALE_FACTOR
        const spacing = BUTTON_CONSTANTS.VERTICAL_SPACING
        const buttonWidth = (userButton.offsetWidth || 80) * BUTTON_CONSTANTS.SCALE_FACTOR // 실제 DOM 너비 사용
        const targetCenterX =
          targetRect.left +
          targetRect.width / 2 -
          pageRect.left -
          buttonWidth / 2

        // 도착 순서대로 밑으로 배치 (scale 적용된 크기로 계산)
        const targetY = startY + index * (buttonHeight + spacing)

        // 원래 위치에서 목표 위치까지의 이동 거리 계산
        const originalPos = this.originalPositions[userIndex]
        const moveX = targetCenterX - originalPos.x
        const moveY = targetY - originalPos.y

        gsap.to(userButton, {
          x: moveX,
          y: moveY,
          scale: BUTTON_CONSTANTS.SCALE_FACTOR,
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
    const elements = document.querySelectorAll('.user-button-container')
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
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()
    const positions: OriginalPosition[] = []

    userButtons.forEach((button) => {
      const element = button as HTMLElement
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
