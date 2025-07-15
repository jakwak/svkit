// 유틸리티 및 설정 파일들
export * from "./globals"
export * from "./clickOutside"
export * from "./appstore.svelte"
export * from "./supabase"

// 기본 컴포넌트들
export { default as Users } from "./components/Users.svelte"
export { default as SupabaseAuth } from "./components/SupabaseAuth.svelte"
export { default as Modal } from "./components/Modal.svelte"
export { default as QInput } from "./components/QInput.svelte"
export { default as CurTime } from "./components/CurTime.svelte"
export { default as QuizList } from "./components/QuizList.svelte"
export { default as QuizView } from "./components/QuizView.svelte"
export { default as AIQuiz } from "./components/AIQuiz.svelte"

// 추가 컴포넌트들
export { default as LoginModal } from "./components/LoginModal.svelte"
export { default as QuizList2 } from "./components/QuizList2.svelte"
export { default as WaitingScreen } from "./components/WaitingScreen.svelte"
export { default as UserStatusList } from "./components/UserStatusList.svelte"
export { default as UserStatusList2 } from "./components/UserStatusList2.svelte"
export { default as PresenceManager } from "./components/PresenceManager.svelte"
export { default as NumberButtons } from "./components/NumberButtons.svelte"
export { default as MainMenu } from "./components/MainMenu.svelte"
export { default as ClassButtons } from "./components/ClassButtons.svelte"
export { default as GameFrame } from "./components/GameFrame.svelte"
export { default as Markdown } from "./components/Markdown.svelte"
export { default as WorkSheet } from "./components/WorkSheet.svelte"
export { default as AIQuizStream } from "./components/AIQuizStream.svelte"
export { default as XYInputText } from "./components/XYInputText.svelte"
export { default as QuizShow } from "./components/QuizShow.svelte"
export { default as Triangle } from "./components/Triangle.svelte"

// 타입 정의들 (globals.ts에서 가져옴)
export type { User, SessionState } from "./globals"
