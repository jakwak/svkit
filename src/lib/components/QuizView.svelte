<script lang="ts">
  import { difficultyOptions } from '$lib/globals'
  import { fade, fly, slide } from 'svelte/transition'
  import Markdown from './Markdown.svelte'
  import QInput from './QInput.svelte'

  let { quiz = $bindable({}), deleteQuiz } = $props()

  // 정답과 오답을 랜덤으로 섞는 함수
  function shuffleAnswers(correctAnswer: string, wrongAnswers: string[]) {
    return [correctAnswer, ...wrongAnswers]
      .map((answer) => ({ answer, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({ num: index + 1, answer: item.answer }))
  }
  // correctAnswer와 wrongAnswers의 모든 길이의 합을 구하는 함수
  function sumOfAllAnswerLengths(
    correctAnswer: string,
    wrongAnswers: string[]
  ) {
    return (
      correctAnswer.length +
      wrongAnswers.reduce((acc, cur) => acc + cur.length, 0)
    )
  }

  let edit = $state(false)
  // let quiz = $state<QuizQuestion | undefined>(undefined)
</script>

{#if quiz}
  <div
    class="max-w-2xl mx-auto bg-zinc-900 p-5 pb-0 rounded-lg shadow-md text-center border-1 border-zinc-500 w-full relative"
  >
    <div class="absolute top-2 left-2 items-center flex">
      <span
        class={[
          'badge badge-sm',
          quiz.subject.includes('국어') && 'badge-primary',
          quiz.subject.includes('수학') && 'badge-secondary',
          quiz.subject.includes('사회') && 'badge-accent',
          quiz.subject.includes('과학') && 'badge-info',
          quiz.subject.includes('영어') && 'badge-error',
          quiz.subject.includes('상식') && 'badge-warning',
        ]}>{quiz.subject.replace('초등 4학년', '')}</span
      >
      &nbsp;-&nbsp;
      <span class="text-zinc-400 text-xs underline"
        >{quiz.topic}({difficultyOptions[quiz.difficulty - 1].label})
      </span>
    </div>
    <div class="text-sm text-justify mt-5 flex font-thin">
      문.&nbsp; <Markdown content={quiz.question} />
    </div>
    <ul
      class={[
        'text-sm',
        sumOfAllAnswerLengths(quiz.correctAnswer, quiz.wrongAnswers) > 20
          ? 'flex flex-col'
          : 'flex flex-wrap justify-evenly gap-2',
      ]}
    >
      {#each shuffleAnswers(quiz.correctAnswer, quiz.wrongAnswers) as item}
        <li
          class={[
            'p-1 pl-5 rounded-lg cursor-pointer text-left flex font-light hover:bg-zinc-800',
            item.answer === quiz.correctAnswer && 'text-secondary font-medium',
          ]}
        >
          {#if item.num === 1}①&nbsp;{/if}
          {#if item.num === 2}②&nbsp;{/if}
          {#if item.num === 3}③&nbsp;{/if}
          {#if item.num === 4}④&nbsp;{/if}
          <Markdown content={item.answer} />
        </li>
      {/each}
    </ul>
    <div class="flex-col">
      <button
        class="btn btn-primary btn-xs btn-ghost"
        onclick={() => {
          edit = true
        }}
        type="button">고치기</button
      >
      <button
        class="btn btn-primary btn-xs btn-ghost"
        onclick={() => {
          deleteQuiz(quiz.id)
        }}
        type="button">지우기</button
      >
    </div>
  </div>

  {#if edit}
    <QInput
      bind:quiz
      modal_open={edit}
      onClose={() => {
        edit = false
      }}
    />
  {/if}
{/if}
