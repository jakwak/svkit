import { gsap } from 'gsap'

export interface User {
  username: string
  id: string
  answer_number: number
}

export interface OriginalPosition {
  x: number
  y: number
}

export class UserAnimationManager {
  private originalPositions: OriginalPosition[] = []
  private isInitialized = false

  initialize(originalPositions: OriginalPosition[]) {
    this.originalPositions = originalPositions
    this.isInitialized = true
  }

  isReady(): boolean {
    return this.isInitialized && this.originalPositions.length > 0
  }

  moveUsersToAnswerNumbers(users: User[]) {
    if (!this.isReady()) return

    const numberButtons = document.querySelectorAll('.number-button')
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()

    // 각 숫자 버튼별로 사용자들을 그룹화
    const usersByAnswer: {
      [key: number]: Array<{ user: User; originalIndex: number }>
    } = {}

    users.forEach((user, index) => {
      if (user.answer_number > 0 && user.answer_number <= 4) {
        if (!usersByAnswer[user.answer_number]) {
          usersByAnswer[user.answer_number] = []
        }
        usersByAnswer[user.answer_number].push({ user, originalIndex: index })
      }
    })

    userButtons.forEach((button, index) => {
      const element = button as HTMLElement
      if (!element) return

      const user = users[index]
      if (!user || user.answer_number === 0) {
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
      const targetNumberIndex = user.answer_number - 1
      if (targetNumberIndex < 0 || targetNumberIndex >= numberButtons.length)
        return

      const targetButton = numberButtons[targetNumberIndex] as HTMLElement
      if (!targetButton) return

      const targetRect = targetButton.getBoundingClientRect()

      // 같은 답변을 선택한 사용자들 중에서 현재 사용자의 순서 찾기
      const sameAnswerUsers = usersByAnswer[user.answer_number] || []
      const userOrder = sameAnswerUsers.findIndex((u) => u.user.id === user.id)

      // 숫자 버튼 바로 아래 세로 일렬 가운데 정렬
      const targetCenterX =
        targetRect.left + targetRect.width / 2 - pageRect.left
      const buttonHeight = 40 // 사용자 버튼의 대략적인 높이
      const spacing = 5 // 버튼 간 간격 (더 좁게)
      const startY = targetRect.bottom - pageRect.top + 5 // 숫자 버튼 바로 아래 5px

      // 단순히 순서대로 세로로 배치
      const targetY = startY + userOrder * (buttonHeight + spacing)

      // 원래 위치에서 목표 위치까지의 이동 거리 계산
      const originalPos = this.originalPositions[index]
      const moveX = targetCenterX - originalPos.x
      const moveY = targetY - originalPos.y

      gsap.to(element, {
        x: moveX,
        y: moveY,
        scale: 0.8,
        opacity: 0.9,
        duration: 0.8,
        ease: 'power2.out',
        delay: index * 0.05,
      })
    })
  }

  moveSingleUserToNumber(users: User[], userIndex: number, targetNumber: number) {
    if (!this.isReady()) return

    const numberButtons = document.querySelectorAll('.number-button')
    const userButtons = document.querySelectorAll('.user-button-container')
    const pageRect = document.body.getBoundingClientRect()

    const targetButton = numberButtons[targetNumber - 1] as HTMLElement
    if (!targetButton) return

    const targetRect = targetButton.getBoundingClientRect()
    const userButton = userButtons[userIndex] as HTMLElement
    if (!userButton) return

    // 숫자 버튼 바로 아래로 이동
    const targetCenterX = targetRect.left + targetRect.width / 2 - pageRect.left
    const buttonHeight = 40
    const spacing = 5
    const startY = targetRect.bottom - pageRect.top + 5

    // 같은 답변을 선택한 사용자들 중에서 맨 마지막 순서로 배치
    const sameAnswerUsers = users.filter(
      (user) => user.answer_number === targetNumber
    )

    // 현재 해당 숫자 버튼 아래에 있는 사용자들의 실제 위치 확인
    let maxY = startY
    sameAnswerUsers.forEach((user, index) => {
      const existingUserIndex = users.findIndex(
        (u) => u.username === user.username
      )
      if (existingUserIndex !== -1) {
        const existingButton = userButtons[existingUserIndex] as HTMLElement
        if (existingButton) {
          const currentRect = existingButton.getBoundingClientRect()
          const currentY = currentRect.bottom - pageRect.top
          if (currentY > maxY) {
            maxY = currentY
          }
        }
      }
    })

    // 마지막 사용자 바로 아래에 배치
    const targetY = maxY + spacing

    // 원래 위치에서 목표 위치까지의 이동 거리 계산
    const originalPos = this.originalPositions[userIndex]
    const moveX = targetCenterX - originalPos.x
    const moveY = targetY - originalPos.y

    gsap.to(userButton, {
      x: moveX,
      y: moveY,
      scale: 0.8,
      opacity: 0.9,
      duration: 0.8,
      ease: 'power2.out',
    })
  }

  moveSingleUserToOriginal(users: User[], userIndex: number, onComplete?: () => void) {
    if (!this.isReady()) return

    const userButtons = document.querySelectorAll('.user-button-container')
    const userButton = userButtons[userIndex] as HTMLElement
    if (!userButton) return

    gsap.to(userButton, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.8,
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
      const sameAnswerUsers = users.filter(
        (user) => user.answer_number === numberIndex
      )

      if (sameAnswerUsers.length === 0) continue

      // 숫자 버튼 바로 아래로 재배치
      const targetCenterX =
        targetRect.left + targetRect.width / 2 - pageRect.left
      const buttonHeight = 40
      const spacing = 5
      const startY = targetRect.bottom - pageRect.top + 5

      sameAnswerUsers.forEach((user, index) => {
        const userIndex = users.findIndex((u) => u.username === user.username)
        if (userIndex === -1) return

        const userButton = userButtons[userIndex] as HTMLElement
        if (!userButton) return

        const targetY = startY + index * (buttonHeight + spacing)

        // 원래 위치에서 목표 위치까지의 이동 거리 계산
        const originalPos = this.originalPositions[userIndex]
        const moveX = targetCenterX - originalPos.x
        const moveY = targetY - originalPos.y

        gsap.to(userButton, {
          x: moveX,
          y: moveY,
          scale: 0.8,
          opacity: 0.9,
          duration: 0.5,
          ease: 'power2.out',
          delay: index * 0.1,
        })
      })
    }
  }

  resetAnimation() {
    // 모든 버튼을 원래 위치로
    const elements = document.querySelectorAll('.user-button-container')
    if (elements.length === 0) {
      console.log('resetAnimation: .user-button-container 요소를 찾을 수 없음')
      return
    }

    gsap.to('.user-button-container', {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  fadeInButtons() {
    gsap.to('.fade-in-button', {
      opacity: 1,
      y: 0,
      duration: 0.6,
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
} 