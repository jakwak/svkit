<script lang="ts">
  import { shuffleAnswers, sumOfAllAnswerLengths } from "$lib"
  import Markdown from "./Markdown.svelte"

  interface Props {
    quiz: QuizQuestion
  }

  let { quiz }: Props = $props()


</script>

<div class="card bg-base-100 shadow-2xl border border-zinc-500 max-w-3xl mx-auto">
  <div class="card-body">
    <h2 class="card-title text-2xl font-light items-baseline">☑️ <Markdown content={quiz.question} /></h2>
    <ul
    class={[
      'text-2xl space-y-2  pt-3',
      sumOfAllAnswerLengths(quiz.correctAnswer, quiz.wrongAnswers) > 15
        ? 'flex flex-col pl-10 '
        : 'flex flex-wrap justify-evenly gap-1',
    ]}
  >
    {#each shuffleAnswers(quiz.correctAnswer, quiz.wrongAnswers) as item}
      <li
        class={[
          'p-1 rounded-lg cursor-pointer text-left flex font-thin hover:underline hover:underline-offset-auto w-fit'
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
  </div>
</div>