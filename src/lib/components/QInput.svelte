<script lang="ts">
  import { enhance } from '$app/forms'
  import Modal from './Modal.svelte'

  const quiz = $state<QuizQuestion>({
    subject: '국어',
    topic: '',
    question: '',
    correctAnswer: '',
    wrongAnswers: ['', '', ''],
    difficulty: 3,
  })

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

<Modal {modal_open} onClose={() => (modal_open = false)} bgColor="bg-zinc-900">
  <form method="POST" use:enhance>
    <div
      class="max-w-2xl mx-auto p-2 rounded-lg shadow-md grid grid-cols-1 gap-2"
    >
      <h2 class="text-xl font-semibold mb-4 text-center">문제 만들기</h2>
      <div class="flex gap-4 mb-2">
        <!-- 과목 -->
        <label class="form-control w-1/4">
          <span class="label-text text-xs">과목</span>
          <select
            name="subject"
            bind:value={quiz.subject}
            class="select w-full"
          >
            <option value="국어">국어</option>
            <option value="수학">수학</option>
            <option value="사회">사회</option>
            <option value="과학">과학</option>
            <option value="영어">영어</option>
            <option value="상식">상식</option>
          </select>
        </label>

        <!-- 주제 -->
        <label class="form-control w-full">
          <span class="label-text text-xs">주제</span>
          <input
            name="topic"
            type="text"
            bind:value={quiz.topic}
            placeholder="주제 입력"
            class="input input-bordered w-full"
          />
        </label>

        <!-- 난이도 선택 -->
        <label class="form-control w-1/4">
          <span class="label-text text-xs">난이도</span>
          <select
            name="difficulty"
            bind:value={quiz.difficulty}
            class="select select-bordered w-full"
          >
            {#each difficultyOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
      </div>
      <!-- 문제 -->
      <label class="form-control w-full mb-2">
        <span class="label-text text-xs">문제</span>
        <input
          name="question"
          type="text"
          bind:value={quiz.question}
          placeholder="문제 입력"
          class="input input-bordered w-full"
        />
      </label>

      <!-- 정답 -->
      <label class="form-control w-full mb-2">
        <span class="label-text text-xs">정답</span>
        <input
          name="correctAnswer"
          type="text"
          bind:value={quiz.correctAnswer}
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
            bind:value={quiz.wrongAnswers[index]}
            placeholder="오답 {index + 1} 입력"
            class="input input-bordered w-full"
          />
        </label>
      {/each}

      <!-- 제출 버튼 -->
      <button
        class="btn btn-primary w-full"
        onclick={() => (modal_open = false)}
        type="submit">제출</button
      >
    </div>
  </form>
</Modal>
