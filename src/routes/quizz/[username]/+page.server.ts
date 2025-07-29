import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { ADMIN_NAME } from '$lib'

export const load: PageServerLoad = async ({ locals, fetch, params }) => {
  try {
    // 백엔드 API에서 사용자 목록과 점수 정보 가져오기
    const scoresResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/scores`)

    if (!scoresResponse.ok) {
      console.error('점수 정보 조회 오류:', scoresResponse.status)
      // 백엔드 API가 실패하면 빈 배열 반환
      return { 
        cur_user: locals.user,
        username: params.username,
        users: [] 
      }
    }

    // 백엔드에서 점수 정보와 함께 사용자 목록 가져오기
    const users = await scoresResponse.json()
    // 선생님을 맨 뒤로 정렬
    users.sort((a: { username: string }, b: { username: string }) => {
      if (a.username === ADMIN_NAME) return 1
      if (b.username === ADMIN_NAME) return -1
      return a.username.localeCompare(b.username)
    })

    return { 
      cur_user: locals.user,
      username: params.username,
      users 
    }
  } catch (error) {
    console.error('사용자 목록 로드 오류:', error)
    return { 
      cur_user: locals.user,
      username: params.username,
      users: [] 
    }
  }
}

export const actions = {
  default: async (event) => {
    // TODO log the user in
  },
} satisfies Actions
