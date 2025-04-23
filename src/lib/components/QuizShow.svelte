<script lang="ts">
  import { appStore, Modal, shuffleAnswers, sumOfAllAnswerLengths } from '$lib'
  import Markdown from './Markdown.svelte'

  interface Props {
    quiz: QuizQuestion
    user_id: number
  }

  let { quiz = $bindable(), user_id }: Props = $props()

  let save_ok = $state(false)
  let confirm_open = $state(false)
  let answer = $state('')

  async function saveAnswer(answer: string) {
    const res = await fetch('/api/answers/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: answer === quiz.correctAnswer,
        selected_answer: answer,
        question_id: quiz.id,
        user_id,
      }),
    })

    if (res.ok) {
      appStore.quiz = null
      console.log('result: ', await res.json())
      save_ok = true            
    }
  }
</script>

<div
  class="card bg-base-100 shadow-2xl border-2 border-primary max-w-3xl mx-auto mt-10"
>
  <div class="card-body">
    <h2 class="card-title text-2xl font-light items-baseline">
      📄 <Markdown content={quiz.question} />
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
          class={['p-1 cursor-pointer flex font-thin w-fit']}
          onclick={() => {
            // saveAnswer(item.answer)
            answer = item.answer
            confirm_open = true
          }}
        >
          <div class="text-xl">
            {#if item.num === 1}① &nbsp;
            {/if}
            {#if item.num === 2}② &nbsp;
            {/if}
            {#if item.num === 3}③ &nbsp;
            {/if}
            {#if item.num === 4}④ &nbsp;
            {/if}
          </div>
          <div class="hover:underline hover:underline-offset-5">
            <Markdown content={item.answer} />
          </div>
        </button>
      {/each}
    </ul>
  </div>
</div>

<Modal bind:modal_open={confirm_open} onClose={() => (confirm_open = false)} modal_top={false} bgColor="bg-zinc-700">
  <div class="text-3xl text-center p-8 border-primary border-2 rounded-lg bg-zinc-900">
    <div class="mb-6"><span class="underline font-bold">{answer}</span></div>
    <div class="mb-6 text-5xl">맞나요 ?</div>
    <div class="flex justify-center gap-6">
      <button class="btn btn-error btn-outline text-xl hover:scale-105 transition-transform" onclick={() => (confirm_open = false)}>
        취소
      </button>
      <button
        class="btn btn-success btn-outline text-xl hover:scale-105 transition-transform"
        onclick={() => {saveAnswer(answer); confirm_open = false}}
      >
        확인
      </button>
    </div>
  </div>
</Modal>


<Modal
  bind:modal_open={save_ok}
  autoClose={2000}
  bgColor={answer === quiz.correctAnswer ? "bg-success" : "bg-error"}
  modal_top={false}
>
  <div class="text-xl text-center p-3">{answer === quiz.correctAnswer ? "😁" : "😅"} 저장 완료 !!!</div>
</Modal>

