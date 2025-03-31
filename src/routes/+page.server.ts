import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
  const users = await fetch('/api/users').then((res) => res.json())
  return {
    users,
  }
}

export const actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData()
    let result;
    if (data.get('ai_question') !== null) {
      result = await fetch('/api/generate_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.get('subject'),
          topic: data.get('topic'),
          difficulty: data.get('difficulty'),
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log(err))

      return { success: true, quiz: result, loading: false }
    }
    return { loading: true}
  },
} satisfies Actions
