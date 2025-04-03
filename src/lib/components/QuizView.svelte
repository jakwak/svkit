<script lang="ts">
  import Markdown from "./Markdown.svelte";

  let {quiz} = $props()

  // 정답과 오답을 랜덤으로 섞는 함수
  function shuffleAnswers(correctAnswer:string, wrongAnswers:string[]) {
    return [correctAnswer, ...wrongAnswers]
      .map((answer) => ({ answer, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({ num: index + 1, answer: item.answer }))
  }
  // correctAnswer와 wrongAnswers의 모든 길이의 합을 구하는 함수
  function sumOfAllAnswerLengths(correctAnswer: string, wrongAnswers: string[]) {
    return correctAnswer.length + wrongAnswers.reduce((acc, cur) => acc + cur.length, 0)
  }
</script>

{#if quiz}
<div class="max-w-2xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-md text-center border-2 border-primary">
  <div class="text-lg font-bold text-white">{quiz.subject}</div>
  <div class="text-sm text-gray-400 mb-4">주제: {quiz.topic}</div>
  <div class="text-xl text-justify my-4 flex font-medium">
    문.&nbsp; <Markdown content={quiz.question} />
  </div>
  <ul class={["space-y-2 text-xl", sumOfAllAnswerLengths(quiz.correctAnswer, quiz.wrongAnswers) > 20 ? 'flex flex-col' : 'flex flex-wrap justify-baseline gap-5']}>
    {#each shuffleAnswers(quiz.correctAnswer, quiz.wrongAnswers) as item}
      <li
        class={[
          'p-1 pl-10 rounded-lg cursor-pointer text-left flex font-medium hover:bg-zinc-800',
          item.answer === quiz.correctAnswer && 'text-secondary',
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
{/if}