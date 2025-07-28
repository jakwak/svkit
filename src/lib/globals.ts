import { marked } from 'marked'
import DOMPurify from 'dompurify' // XSS 방지를 위한 라이브러리 (선택적)

export const difficultyOptions = [
  { value: 1, label: '매우 쉬움' },
  { value: 2, label: '쉬움' },
  { value: 3, label: '보통' },
  { value: 4, label: '어려움' },
  { value: 5, label: '매우 어려움' },
]

export enum TagSave {
  NOT_SAVED = 'not saved',
  NOT_UPDATED = 'not updated',
  SAVED = 'saved',
}

export const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME || '선생님'
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'teacher@gxg.kro.kr'
export const GUEST_USER = 'Guest'

// 애니메이션 관련 상수
export const ANIMATION_CONSTANTS = {
  FADE_IN_DURATION: 1200,
  MOVE_DURATION: 800,
  RESET_DURATION: 300,
  DEBOUNCE_DELAY: 100,
  USER_CLICK_TIMEOUT: 8000,
  FADE_IN_DELAY: 100,
  POSITION_SAVE_DELAY: 1200,
  RESIZE_TIMEOUT: 300,
} as const

// 사용자 관련 상수
export const USER_CONSTANTS = {
  DEFAULT_VARIANT: 'gray',
  PRIMARY_VARIANT: 'primary',
  SECONDARY_VARIANT: 'secondary',
  SUCCESS_VARIANT: 'success',
  WARNING_VARIANT: 'warning',
  DANGER_VARIANT: 'danger',
  MAX_ANSWER_NUMBER: 4,
  MIN_ANSWER_NUMBER: 0,
  DEFAULT_ANSWER_NUMBER: 0,
  RANDOM_ANSWER_MIN: 1,
  RANDOM_ANSWER_MAX: 4,
} as const

// z-index 관련 상수
export const Z_INDEX_CONSTANTS = {
  BASE_Z_INDEX: 1,
  ANIMATION_Z_INDEX: 10,
  USER_BUTTON_Z_INDEX: 5,
  NUMBER_BUTTON_Z_INDEX: 1,
} as const

// 버튼 스타일 관련 상수
export const BUTTON_CONSTANTS = {
  DEFAULT_SIZE: 'medium',
  SMALL_SIZE: 'small',
  LARGE_SIZE: 'large',
  VERTICAL_SPACING: 4,
  HORIZONTAL_SPACING: 2,
  BUTTON_HEIGHT: 40,
  BUTTON_WIDTH: 80,
} as const

// 세션 상태 타입 정의
export type SessionState = 'idle' | 'game' | 'start' | 'waiting' | 'quiz' | 'result' | 'end'

export function shuffleAnswers(correctAnswer: string, wrongAnswers: string[]) {
  return [correctAnswer, ...wrongAnswers]
    .map((answer) => ({ answer, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item, index) => ({ num: index + 1, answer: item.answer }))
}

export function sumOfAllAnswerLengths(
  correctAnswer: string,
  wrongAnswers: string[]
) {
  return (
    (correctAnswer?.length || 0) +
    (wrongAnswers?.reduce((acc, cur) => acc + (cur?.length || 0), 0) || 0)
  )
}

// 마크다운을 안전하게 HTML로 변환하는 함수
function markdownToHtml(markdown: string): string {
  // if (!markdown) return '';

  // // 이미 HTML인지 확인 (간단한 방법)
  // if (markdown.includes('<') && markdown.includes('>')) {
  //   return markdown; // 이미 HTML이면 그대로 반환
  // }

  // DOMPurify가 설치되어 있다면 사용 (XSS 방지)
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(marked.parse(markdown, { async: false }))
  }
  // 아니면 그냥 변환
  return marked.parse(markdown, { async: false })
}

// 간단한 마크다운 처리 함수
export function simpleMarkdown(text: string): string {
  if (!text) return ''

  // 이미 HTML인지 확인
  if (text.includes('<') && text.includes('>')) {
    return text
  }

  // 볼드 처리 (**텍스트**)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 이탤릭 처리 (*텍스트*)
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 코드 처리 (`텍스트`)
  text = text.replace(/`(.*?)`/g, '<code>$1</code>')

  // 줄바꿈 처리
  text = text.replace(/\n/g, '<br>')

  return markdownToHtml(text)
}

export function getCurDateTime() {
  return (
    new Date().getFullYear() +
    String(new Date().getMonth() + 1).padStart(2, '0') +
    String(new Date().getDate()).padStart(2, '0') +
    String(new Date().getHours()).padStart(2, '0') +
    String(new Date().getMinutes()).padStart(2, '0') +
    String(new Date().getSeconds()).padStart(2, '0')
  )
}
