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