<script lang="ts">
  import { onMount } from 'svelte'

  // 문제 데이터
  const quizData = {
    subject: '초등 4학년 국어',
    topic: '맞춤법',
    question: `다음 중 맞춤법이 <u>맞춤법</u>이 <span class='bg-red-500'>틀린 문장</span>은 무엇인지 고르세요.`,
    correctAnswer: '밖이 춥다.',
    wrongAnswers: ['학교가 좋다.', '집이 넓다.', '마음이 착하다.'],
    difficulty: '보통',
  }

  let answers: { num: number; answer: string }[] = []

  // 정답과 오답을 랜덤으로 섞는 함수
  function shuffleAnswers() {
    answers = [quizData.correctAnswer, ...quizData.wrongAnswers]
      .map((answer) => ({ answer, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, index) => ({ num: index + 1, answer: item.answer }))
  }

  // 컴포넌트가 마운트될 때 실행
  onMount(() => shuffleAnswers())
</script>

<div class="max-w-2xl mx-auto bg-zinc-900 p-6 rounded-lg shadow-md text-center">
  <div class="text-lg font-bold text-white">{quizData.subject}</div>
  <div class="text-sm text-gray-500 mb-4">주제: {quizData.topic}</div>
  <div class="text-2xl text-left mb-4">
    문. {@html  quizData.question} 
  </div>
  <ul class="space-y-2 text-2xl">
    {#each answers as item}
      <li
        class={[
          'p-1 pl-7 rounded-lg cursor-pointer text-left',
          item.answer === quizData.correctAnswer && 'text-secondary',
        ]}
      >
        {#if item.num === 1}①{/if}
        {#if item.num === 2}②{/if}
        {#if item.num === 3}③{/if}
        {#if item.num === 4}④{/if}
        {item.answer}
      </li>
    {/each}
  </ul>
</div>
