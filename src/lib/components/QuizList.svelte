<script lang="ts">
  import { Modal } from '$lib'
  import { onMount } from 'svelte'
  import AiQuiz from './AIQuiz.svelte'
  import QuizView from './QuizView.svelte'
  import { type ActionResult } from '@sveltejs/kit';
  import { goto, invalidate, invalidateAll } from '$app/navigation'
  import { TagSave } from '$lib/globals'

  let quizList = $state<QuizQuestion[]>([])

  interface QuizData {
    id: string
    subject: string
    topic: string
    question: string
    correct_answer: string
    wrong_answer1: string
    wrong_answer2: string
    wrong_answer3: string
    difficulty: string
  }
  interface QuizzesData {
    items: QuizData[]
    page: number
    pages: number
    size: number
    total: number
  }

  let { items, page, pages, size, total }: QuizzesData = $props()

  $effect(() => {
    quizList = items.map((item) => ({
      id: item.id,
      subject: item.subject,
      topic: item.topic,
      question: item.question,
      correctAnswer: item.correct_answer,
      wrongAnswers: [item.wrong_answer1, item.wrong_answer2, item.wrong_answer3],
      difficulty: Number(item.difficulty) as DifficultyLevel,
      save: TagSave.SAVED
    }))
  })
  
  let loading = $state(false)

  async function deleteQuiz(quiz: QuizQuestion) {
    quizList = quizList.filter((item) => item.id !== quiz.id)

    // db에 저장된 문제를 삭제하고, 새로 고침
    if(quiz.save !== TagSave.NOT_SAVED) {
      // document.cookie = `redirectTo=${encodeURIComponent(window.location.href)}; path=/`;
      // goto('/?del=true&id=' + quiz.id)
      // invalidateAll()
      const res = await fetch('/api/questions/' + quiz.id, {
        method: 'DELETE',
      })

      if (res.ok) {
        console.log('result: ', await res.json());
        invalidateAll()
      }
    }
  }

</script>

<AiQuiz enhanced={() => {
  loading = true
  return async ({ result }: { result: ActionResult}) => {
    // await update()
    loading = false
    if (result.type === 'success') {
      if (result.data?.quiz) {
        result.data.quiz.id = Math.random().toString(36).slice(2)
        result.data.quiz.save = "not saved"
        quizList = [result.data?.quiz as QuizQuestion, ...quizList]
      }       
    }
  }
}} />

<Modal modal_open={loading} clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>

<div class='text-sm text-center mb-[-3px]'>
  <a href='{page > 1 ? `/?page=${page - 1}` : ''}'>◀</a> . . .
  <a href='{page < pages ? `/?page=${page + 1}` : ''}'>▶</a>
</div>
<div class='text-xs text-right pr-3.5 mb-1'>page: {page}/{pages}, size: {size}/{total}</div>

<div class="columns-xs xl:columns-3 2xl:columns-4 3xl:columns-5 gap-4">
  {#each quizList as quiz, i}
    <div class="mb-4 break-inside-avoid rounded-lg">
    <QuizView bind:quiz={quizList[i]} {deleteQuiz} />
  </div>
  {/each}
</div>
