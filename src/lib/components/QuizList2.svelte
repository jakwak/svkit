<script lang="ts">
  import { onMount } from 'svelte'
  import QuizView from './QuizView.svelte'
  import { fade } from 'svelte/transition'
  import { toast } from '@zerodevx/svelte-toast'
  import AiQuiz from './AIQuiz.svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import Modal from './Modal.svelte'
  import { TagSave } from '$lib/globals'

  let quizList = $state<QuizQuestion[]>([])
  let page = $state(1)
  let totalPages: null | number = $state(null)
  let observer: IntersectionObserver
  let loadMoreTrigger: HTMLElement
  let curSubject = $state('초등 4학년 전과목')

  $effect(() => {
    const eventSource = new EventSource('/api/questions_async?page=' + page)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.total_pages) {
          totalPages = Number.parseInt(data.total_pages)
          return
        }

        const quiz: QuizQuestion = {
          id: data.id,
          subject: data.subject,
          topic: data.topic,
          question: data.question,
          correctAnswer: data.correct_answer,
          wrongAnswers: data.wrong_answers,
          difficulty: data.difficulty,
          save: TagSave.SAVED,
        }
        quizList = [...quizList, quiz]
      } catch (error) {
        console.error('JSON 파싱 오류:', error)
      }
    }

    eventSource.onerror = (error) => {
      // console.error('SSE 연결 오류:', error);
      eventSource.close()
    }
  })

  onMount(() => {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        page++
        if (totalPages && page === totalPages) {
          setTimeout(() => {
            toast.push('더 이상 데이터가 없습니다.', {
              theme: {
                '--toastBackground': '#333',
                '--toastColor': '#fff',
                '--toastBarBackground': '#666',
              },
            })
          }, 3000)
          observer.disconnect()
        }
      }
    })
    observer.observe(loadMoreTrigger)
  })
  
  let loading = $state(false)

  async function deleteQuiz(quiz: QuizQuestion) {
    quizList = quizList.filter((item) => item.id !== quiz.id)

    // db에 저장된 문제를 삭제하고, 새로 고침
    if(quiz.save !== TagSave.NOT_SAVED) {
      const res = await fetch('/api/questions/' + quiz.id, {
        method: 'DELETE',
      })

      if (res.ok) {
        console.log('result: ', await res.json());
        // invalidateAll()
      }
    }
  }
</script>

<Modal modal_open={loading} clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>

<AiQuiz  bind:curSubject enhanced={({ formData }: { formData: FormData }) => {
  if(formData.get('subject') === '초등 4학년 전과목') {
    toast.push('과목을 선택하세요', { theme: { '--toastBackground': '#F56565' }})
    return
  }

  loading = true
  return async ({ result }: { result: ActionResult}) => {

    // await update()
    loading = false
    if (result.type === 'success') {
      if (result.data?.quiz) {
        result.data.quiz.id = Math.random().toString(36).substring(2, 10)
        result.data.quiz.save = TagSave.NOT_SAVED
        quizList = [result.data?.quiz as QuizQuestion, ...quizList]
      }       
    }
  }
}} />

<div class="masonry-grid">
  {#each quizList as _, i}
    {#if curSubject === '초등 4학년 전과목' || curSubject === quizList[i].subject}
      <div class="masonry-item" in:fade={{ duration: 500 }}>
        <QuizView bind:quiz={quizList[i]} {deleteQuiz} />
      </div>
    {/if}
  {/each}
</div>

<!-- 페이지 하단에 위치할 요소 -->
<div bind:this={loadMoreTrigger}></div>

<style>
  .masonry-grid {
    column-count: 2;
    column-gap: 1rem;
  }

  @media (max-width: 576px) {
    .masonry-grid {
      column-count: 1;
    }
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
</style>
