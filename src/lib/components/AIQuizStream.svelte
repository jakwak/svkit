<script lang="ts">
  import { toast } from '@zerodevx/svelte-toast'
  import { onMount } from 'svelte';

  import QuizView from './QuizView.svelte'

  let topic = $state('')
  let subject = $state('초등 4학년 국어')
  let count = $state('10')
  
  // Svelte 5 runes를 사용한 상태 관리
  let questions = $state<any[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  // 수학 표기법 처리를 위한 설정 (MathJax 또는 KaTeX 사용 시)
  onMount(() => {
    // MathJax가 전역으로 로드되어 있다면 수학 표기법 렌더링
    if (typeof window.MathJax !== 'undefined') {
      window.MathJax.typeset();
    }
  });
  
  // 스트리밍 요청 함수
  async function fetchQuestions() {
    // topic = topic === '' ? '과목 전체' : topic;
    
    loading = true;
    error = null;
    // 기존 문제를 유지하지 않고 새로 시작
    questions = [];
    
    try {
      const response = await fetch('/api/stream_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, topic, count })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status === 'success') {
              // 각 문제를 받을 때마다 즉시 UI에 반영하기 위한 처리
              const newQuestion = data.question;
              
              // 1. 각 문제를 개별적으로 추가하고 마이크로태스크 큐를 사용하여 렌더링 사이클 보장
              await new Promise(resolve => setTimeout(resolve, 0));
              questions = [...questions, newQuestion];
              
              // 2. 선택적으로 약간의 지연을 추가하여 사용자가 각 문제가 추가되는 것을 볼 수 있게 함
              // 너무 빠르게 추가되면 사용자가 인지하기 어려울 수 있음
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // 3. 수학 표기법 렌더링 (MathJax 사용 시)
              if (typeof window.MathJax !== 'undefined') {
                setTimeout(() => {
                  window.MathJax.typeset();
                }, 100);
              }
            } else if (data.status === 'processing') {
              toast.push(data.message);
            } else if (data.status === 'error') {
              console.error('Error:', data.error);
              error = data.error;
            }
          } catch (e) {
            console.error('Failed to parse JSON:', line, e);
          }
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }
  
  // 컴포넌트 마운트 시 자동으로 문제 가져오기
  // onMount(() => {
  //   fetchQuestions('수학', '삼각함수', 10);
  // });
</script>

<svelte:head>
  <!-- MathJax 로드 (수학 표기법 렌더링을 위해) -->
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</svelte:head>


<div
  class="w-full max-w-2xl mx-auto flex flex-col"
>
  <div class="flex gap-2 mb-2 items-end">
    <select name="subject" class="select w-fit text-xs border-primary" bind:value={subject}>
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

    <select name="count" class="select select-bordered w-fit text-xs border-primary" bind:value={count}>
      <option value="1">1문제</option>
      <option value="3">3문제</option>
      <option value="5">5문제</option>
      <option value="7">7문제</option>
      <option value="10">10문제</option>
    </select>

    <button
      class="btn btn-info text-lg"
      type="submit"
      onclick={fetchQuestions}
      name="ai_question">AI 출제</button
    >
  </div>
</div>

<div class="container mx-auto p-4">  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{error}</p>
    </div>
  {/if}
  
  <div class="space-y-4">
    {#if loading && questions.length === 0}
      <div class="text-center p-4">
        <p>문제를 생성하는 중입니다...</p>
      </div>
    {/if}
    
    {#each questions as question, i}
      <div class="bg-zinc-900 shadow-md rounded p-4 transition-all duration-500 font-thin" 
           style="animation: fadeInUp 0.5s ease-out forwards;">
        <!-- <h2 class="text-xl font-semibold mb-2">문제 {i + 1}</h2>
        <p class="mb-2"><strong>과목:</strong> {question.subject}</p>
        <p class="mb-2"><strong>주제:</strong> {question.topic}</p>
        <p class="mb-2"><strong>난이도:</strong> {question.difficulty}</p>
        <div class="mb-2">
          <strong>질문:</strong>
          <div class="mt-1 markdown-content">{@html simpleMarkdown(question.question)}</div>
        </div>
        <div class="mb-2">
          <strong>정답:</strong>
          <div class="mt-1 markdown-content">{@html simpleMarkdown(question.correctAnswer)}</div>
        </div>
        <div>
          <strong>오답:</strong>
          <ul class="list-disc pl-5 mt-1">
            {#each question.wrongAnswers as wrongAnswer}
              <li class="markdown-content">{@html simpleMarkdown(wrongAnswer)}</li>
            {/each}
          </ul>
        </div> -->
        <QuizView bind:quiz={questions[i]} />
      </div>
    {/each}
  </div>
</div>

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