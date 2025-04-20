<script lang="ts">
  import { Modal, shuffleAnswers, sumOfAllAnswerLengths } from '$lib'
  import Markdown from './Markdown.svelte'

  interface Props {
    quiz: QuizQuestion,
    user_id: number
  }

  let { quiz, user_id }: Props = $props()

  async function saveAnswer(answer: string) {
    const res = await fetch('/api/answers/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: true,
        selected_answer: answer,
        question_id: quiz.id,
        user_id
      })
    })

    if (res.ok) {
      console.log("result: ",await res.json());      
      alert('저장 완료 !!!')
    }
  }
</script>

<div
  class="card bg-base-100 shadow-2xl border-2 border-primary max-w-3xl mx-auto mt-10"
>
  <div class="card-body">
    <h2 class="card-title text-2xl font-light items-baseline">
      ☑️ <Markdown content={quiz.question} />
    </h2>
    <ul
      class={[
        'text-2xl space-y-2  pt-3',
        sumOfAllAnswerLengths(quiz.correctAnswer, quiz.wrongAnswers) > 15
          ? 'flex flex-col pl-10 '
          : 'flex flex-wrap justify-evenly gap-1',
      ]}
    >
      {#each shuffleAnswers(quiz.correctAnswer, quiz.wrongAnswers) as item}
        <button
          class={[
            'p-1 cursor-pointer flex font-thin',
          ]}
          onclick={() => {saveAnswer(item.answer)}}
        >
          <div class="text-xl">
            {#if item.num === 1}①&nbsp;{/if}
            {#if item.num === 2}②&nbsp;{/if}
            {#if item.num === 3}③&nbsp;{/if}
            {#if item.num === 4}④&nbsp;{/if}
          </div>
          <div class="hover:underline hover:underline-offset-5 w-fit">
            <Markdown content={item.answer} />
          </div>
        </button>
      {/each}
    </ul>
  </div>
</div>