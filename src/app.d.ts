// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  // 난이도 레벨 타입
  type DifficultyLevel = 1 | 2 | 3 | 4 | 5

  // 퀴즈 문제 인터페이스
  interface QuizQuestion {
    id: string
    subject: string
    topic: string
    question: string
    correctAnswer: string
    wrongAnswers: [string, string, string] // 정확히 3개의 오답
    difficulty: DifficultyLevel
  }

  interface QuizSet {
    id: string
    title: string
    questions: QuizQuestion[]
    createdAt: Date
  }

  interface UserInfo {
    id: string
    username: string
    score: {
      total_score: number
      today_score: number
    }
  }

  // 사용자 정의 이벤트 타입
  interface CustomEventMap {
    'quiz:created': CustomEvent<QuizQuestion>
    'quiz:updated': CustomEvent<{ id: string; changes: Partial<QuizQuestion> }>
  }
  
  // Svelte 이벤트 핸들러 확장
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
