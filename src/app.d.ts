// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  // 난이도 레벨 타입
  type DifficultyLevel = 1 | 2 | 3 | 4 | 5

  interface Message  {
    message: string;
    payload?: {} | null;
  };

  // 퀴즈 문제 인터페이스
  interface QuizQuestion {
    id?: string | number
    subject: string
    topic: string
    question: string
    correctAnswer: string
    wrongAnswers: [string, string, string] // 정확히 3개의 오답
    difficulty: DifficultyLevel
    createdAt?: Date
    save?: TagSave
  }

  interface QuizSet {
    id: string
    title: string
    questions: QuizQuestion[]
    createdAt: Date
  }

  interface User {
    id: string
    username: string
    score?: {
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
    interface Locals {
      user: User | null
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
