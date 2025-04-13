import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { TagSave } from '$lib/globals'

export const load: PageServerLoad = async ({ fetch, url, cookies }) => {
  const del = url.searchParams.get('del') || false
  const id = url.searchParams.get('id')
  const prev = cookies.get('redirectTo') || '/'
  
  if (del) {
    const result = await fetch('/api/questions/' + id, {
      method: 'DELETE',
    })
    if (result.ok) {   
      cookies.delete('redirectTo', { path: '/' });
      redirect(303, prev)
    } else {
      console.log('error: ', await result.json());
    }
  }

  const page =  url.searchParams.get('page') || '1';
  const size = url.searchParams.get('size') || '5';

  const users = await fetch('/api/users').then((res) => res.json())
  const quizzes = await fetch('/api/questions?page=' + page + '&size=' + size + '').then((res) => res.json())

  return {
    users, quizzes
  }
}

export const actions = {
  aiquiz: async ({ request, fetch }) => {
    const data = await request.formData()
    let result
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
      .catch((result) => {
        console.log(result)
        // return { success: false, result }
      })
    return { success: true, quiz: result }
  },
  saveQuiz: async ({ request, fetch }) => {
    const formData = await request.formData()
    const quizJson = formData.get('quiz')
    let quiz
    if (typeof quizJson === 'string') {
      try {
        quiz = JSON.parse(quizJson)
      } catch (error) {
        console.error('JSON 파싱 오류:', error)
      }
    }
    let result

    if (quiz.save === TagSave.NOT_SAVED) {
      result = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: quiz.subject,
          topic: quiz.topic,
          question: quiz.question,
          correct_answer: quiz.correctAnswer,
          wrong_answer1: quiz.wrongAnswers[0],
          wrong_answer2: quiz.wrongAnswers[1],
          wrong_answer3: quiz.wrongAnswers[2],
          difficulty: quiz.difficulty,
        }),
      })
    } else {
      result = await fetch(`/api/questions/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: quiz.subject,
          topic: quiz.topic,
          question: quiz.question,
          correct_answer: quiz.correctAnswer,
          wrong_answers: quiz.wrongAnswers,
          difficulty: quiz.difficulty,
        }),
      })
    }

    if (result.ok) {
      return { quiz: await result.json(), save: quiz.save === 'not saved' }
    } else {
      return { result: await result.json() }
    }
  },
} satisfies Actions
