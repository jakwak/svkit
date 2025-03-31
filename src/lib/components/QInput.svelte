<script lang="ts">
  import { enhance } from '$app/forms'
  import Modal from './Modal.svelte'

  let {quiz = {
    subject: '초등 4학년 국어',
    topic: '',
    question: '',
    correctAnswer: '',
    wrongAnswers: ['', '', ''],
    difficulty: 3
  }, loading = false} = $props()

  const difficultyOptions = [
    { value: 5, label: '매우 어려움' },
    { value: 4, label: '어려움' },
    { value: 3, label: '보통' },
    { value: 2, label: '쉬움' },
    { value: 1, label: '매우 쉬움' },
  ]

  let modal_open = $state(false)
</script>

<button
  class="cursor-pointer hover:text-secondary"
  onclick={() => (modal_open = true)}>문제 만들기</button
>


<Modal {modal_open} onClose={() => (modal_open = false)} bgColor="bg-zinc-850">
  <form method="POST" use:enhance class="border-2 border-primary p-4 rounded-lg">    
    <div
      class="max-w-2xl mx-auto p-2 rounded-lg shadow-md grid grid-cols-1 gap-2"
    >
      <h2 class="text-xl font-semibold mb-4 text-center">문제 만들기</h2>
      <div class="flex gap-4 mb-2 items-end">
        <!-- 과목 -->
        <label class="form-control w-1/4">
          <span class="label-text text-xs">과목</span>
          <select
            name="subject"
            value={quiz.subject}
            class="select w-full"
          >
            <option value="초등 4학년 국어">국어</option>
            <option value="초등 4학년 수학">수학</option>
            <option value="초등 4학년 사회">사회</option>
            <option value="초등 4학년 과학">과학</option>
            <option value="초등 4학년 영어">영어</option>
            <option value="초등 4학년 상식">상식</option>
          </select>
        </label>

        <!-- 주제 -->
        <label class="form-control w-full">
          <span class="label-text text-xs">주제</span>
          <input
            name="topic"
            type="text"
            value={quiz.topic}
            placeholder="주제 입력"
            class="input input-bordered w-full"
          />
        </label>

        <!-- 난이도 선택 -->
        <label class="form-control w-1/4">
          <span class="label-text text-xs">난이도</span>
          <select
            name="difficulty"
            value={quiz.difficulty}
            class="select select-bordered w-full"
          >
            {#each difficultyOptions as option}
              <option value={option.value} selected={option.value === quiz.difficulty}>{option.label}</option>
            {/each}
          </select>
        </label>
        <button class="btn btn-secondary" type="submit" name="ai_question" onclick={() => (loading = true)}>AI 출제</button>
      </div>
      <!-- 문제 -->
      <label class="form-control w-full mb-2 flex flex-col">
        <span class="label-text text-xs">문제</span>
        <!-- <input
          name="question"
          type="text"
          value={quiz.question}
          placeholder="문제 입력"
          class="input input-bordered w-full"
        /> -->
        <textarea name="question" class="textarea w-full" placeholder="문제">{quiz.question}</textarea>
      </label>

      <!-- 정답 -->
      <label class="form-control w-full mb-2">
        <span class="label-text text-xs">정답</span>
        <input
          name="correctAnswer"
          type="text"
          value={quiz.correctAnswer}
          placeholder="정답 입력"
          class="input input-bordered w-full"
        />
      </label>

      {#each quiz.wrongAnswers as _, index}
        <label class="form-control w-full mb-2">
          <span class="label-text text-xs">오답 {index + 1}</span>
          <input
            name="wrongAnswer{index + 1}"
            type="text"
            value={quiz.wrongAnswers[index]}
            placeholder="오답 {index + 1} 입력"
            class="input input-bordered w-full"
          />
        </label>
      {/each}

      <!-- 제출 버튼 -->
      <button
        class="btn btn-primary w-full"
        onclick={() => (modal_open = false)}
        type="submit">문제 출제</button
      >
    </div>
  </form>
</Modal>

<Modal modal_open={loading}  clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>