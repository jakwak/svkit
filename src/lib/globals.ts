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

export const AdminUser = '선생님'
export const Guest = 'Guest'

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
    correctAnswer.length +
    wrongAnswers.reduce((acc, cur) => acc + cur.length, 0)
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
