<script lang="ts">
  import { toast } from '@zerodevx/svelte-toast'
  import { getContext, onMount } from 'svelte'

  import QuizView from './QuizView.svelte'
  import { difficultyOptions, getCurDateTime, Modal, TagSave } from '$lib'

  let { id = null, worksheets = $bindable([]), curWorksheet = $bindable(null) } = $props()

  let topic = $state('')
  let subject = $state('초등 4학년 국어')
  let count = $state('10')
  let difficulty = $state(3)

  // Svelte 5 runes를 사용한 상태 관리
  let questions = $state<any[]>([])
  let loading = $state(false)
  let error = $state<string | null>(null)

  // 수학 표기법 처리를 위한 설정 (MathJax 또는 KaTeX 사용 시)
  onMount(() => {
    // MathJax가 전역으로 로드되어 있다면 수학 표기법 렌더링
    if (typeof window.MathJax !== 'undefined') {
      window.MathJax.typeset()
    }
  })
  

  $effect(() => {
    if (id) {
      fetchSavedQuestions()
    }
  })

  async function fetchSavedQuestions() {
    try {
      loading = true
      const response = await fetch(`/api/worksheets/${id}/questions`)

      if (!response.ok) {
        questions = []
        throw new Error(`등록된 문제가 없습니다.`)
      }

      const data = await response.json()

      questions = data.map((question: any) => ({
        ...question,
        correctAnswer: question.correct_answer,
        wrongAnswers: [question.wrong_answer1, question.wrong_answer2, question.wrong_answer3],
        save: 'saved',}
      ))
    } catch (err) {
      error =
        err instanceof Error ? err.message : '문제를 불러오는데 실패했습니다.'
      toast.push(error, { theme: { '--toastBackground': '#F56565' } })
    } finally {
      loading = false
    }
  }

  // 스트리밍 요청 함수
  async function fetchQuestions() {
    loading = true
    error = null

    try {
      const response = await fetch('/api/stream_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, topic, count, difficulty }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.status === 'success') {
              // 각 문제를 받을 때마다 즉시 UI에 반영하기 위한 처리
              const newQuestion = data.question
              newQuestion.id = Math.random().toString(36).substring(2, 10)
              newQuestion.save = TagSave.NOT_SAVED

              // 1. 각 문제를 개별적으로 추가하고 마이크로태스크 큐를 사용하여 렌더링 사이클 보장
              await new Promise((resolve) => setTimeout(resolve, 0))
              questions = [newQuestion, ...questions]

              // 2. 선택적으로 약간의 지연을 추가하여 사용자가 각 문제가 추가되는 것을 볼 수 있게 함
              // 너무 빠르게 추가되면 사용자가 인지하기 어려울 수 있음
              await new Promise((resolve) => setTimeout(resolve, 100))

              // 3. 수학 표기법 렌더링 (MathJax 사용 시)
              if (typeof window.MathJax !== 'undefined') {
                setTimeout(() => {
                  window.MathJax.typeset()
                }, 100)
              }
            } else if (data.status === 'processing') {
              toast.push(data.message, { duration: 1000 })
            } else if (data.status === 'error') {
              console.error('Error:', data.error)
              error = data.error
            }
          } catch (e) {
            console.error('Failed to parse JSON:', line, e)
          }
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    } finally {
      loading = false
    }
  }

  async function deleteQuiz(quiz: QuizQuestion) {
    questions = questions.filter((item) => item.id !== quiz.id)

    // db에 저장된 문제를 삭제하고, 새로 고침
    if (quiz.save && quiz.save !== TagSave.NOT_SAVED) {
      const res = await fetch('/api/questions/' + quiz.id, {
        method: 'DELETE',
      })

      if (res.ok) {
        // console.log('result: ', await res.json());
        toast.push('문제가 삭제되었습니다.')
        // invalidateAll()
      }
    }
  }

  let modal_open = $state(false)

  async function handleSubmit(
    event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const title = formData.get('title')
    const description = formData.get('description')

    const quizzes = questions.map((quiz) => ({
      subject: quiz.subject,
      topic: quiz.topic,
      question: quiz.question,
      correct_answer: quiz.correctAnswer,
      wrong_answer1: quiz.wrongAnswers[0],
      wrong_answer2: quiz.wrongAnswers[1],
      wrong_answer3: quiz.wrongAnswers[2],
      difficulty: quiz.difficulty,
    }))

    const data = {
      title,
      description,
      questions: quizzes,
    }

    const res = await fetch('/api/worksheets/with-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      modal_open = false
      const result = await res.json()
      console.log('result: ', result)
      toast.push('문제가 저장되었습니다.')
      worksheets = [result, ...worksheets]
      curWorksheet = result
    }
  }
</script>

<svelte:head>
  <!-- MathJax 로드 (수학 표기법 렌더링을 위해) -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script> -->
</svelte:head>

<div class="w-full max-w-3xl mx-auto flex flex-col">
  <div class="flex gap-2 mb-2 items-center">
    <select
      name="subject"
      class="select w-fit text-xs border-primary"
      bind:value={subject}
    >
      <option value="초등 4학년 국어">국어</option>
      <option value="초등 4학년 수학">수학</option>
      <option value="초등 4학년 사회">사회</option>
      <option value="초등 4학년 과학">과학</option>
      <option value="초등 4학년 영어">영어</option>
      <option value="초등 4학년 상식">상식</option>
    </select>

    <div class="relative w-full">
      <input
        name="topic"
        type="text"
        placeholder="주제 입력"
        class="input input-bordered w-full text-xs border-primary"
        bind:value={topic}
      />
      {#if topic}
        <button
          type="button"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
          onclick={() => (topic = '')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {/if}
    </div>

    <select
      name="difficulty"
      class="select select-bordered w-fit text-xs border-primary"
      bind:value={difficulty}
    >
      {#each difficultyOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
      <option value="0">골고루</option>
    </select>

    <select
      name="count"
      class="select select-bordered w-fit text-xs border-primary"
      bind:value={count}
    >
      <option value="1">1문제</option>
      <option value="3">3문제</option>
      <option value="5">5문제</option>
      <option value="7">7문제</option>
      <option value="10">10문제</option>
    </select>

    <!-- <label class="label text-xs">
      <input type="checkbox" checked class="checkbox" />
      Remember me
    </label> -->

    <button
      class="btn btn-primary"
      type="submit"
      onclick={fetchQuestions}
      name="ai_question">AI 출제</button
    >

    <button
      class="btn btn-info"
      type="button"
      hidden={id !== null}
      disabled={loading || questions.length === 0}
      onclick={() => (modal_open = true)}
      name="ai_question">저장</button
    >
  </div>
</div>

<div>
  <div class="space-y-1">
    {#if loading && questions.length === 0}
      <div class="text-center p-4">
        <p>문제를 생성하는 중입니다...</p>
      </div>
    {/if}

    <div class="masonry-grid">
      {#each questions as _, i}
        <div
          class="shadow-md rounded transition-all duration-500 font-thin masonry-item"
          style="animation: fadeInUp 0.5s ease-out forwards;"
        >
          <QuizView bind:quiz={questions[i]} {deleteQuiz} wsNum={i + 1} wsID={id} />
        </div>
      {/each}
    </div>
  </div>
</div>

<Modal
  {modal_open}
  bgColor="bg-zinc-900 border-primary border-2"
  modal_top={true}
  onClose={() => (modal_open = false)}
>
  <form method="POST" onsubmit={handleSubmit} class="flex flex-col gap-2 w-md">
    <input
      type="text"
      name="title"
      class="input w-full"
      value={subject.replace(/\s+/g, '_') + '-' + getCurDateTime()}
    />
    <textarea name="description" class="textarea w-full" placeholder="설명"
    ></textarea>
    <button type="submit" class="btn btn-primary">저장</button>
  </form>
</Modal>

<Modal modal_open={loading} clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>

<style>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
