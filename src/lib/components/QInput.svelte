<script lang="ts">
  import { enhance } from '$app/forms'
  import { difficultyOptions, TagSave } from '$lib'
  import Modal from './Modal.svelte'

  let {
    quiz = $bindable({}),
    onClose = () => {},
    modal_open = false,
  } = $props()

  const tag_save = () => {
    if (quiz.save === TagSave.SAVED) {
      quiz.save = TagSave.NOT_UPDATED
    }
  }
</script>

<!-- <button
  class="cursor-pointer hover:text-secondary hover:font-bold font-light"
  onclick={() => (modal_open = true)}>출제</button
> -->

<Modal {modal_open} onClose={()=>onClose()} bgColor="bg-zinc-850">
  <form
    method="POST"
    use:enhance
    class="border-2 border-primary p-4 rounded-lg"
  >
    <div
      class="max-w-2xl mx-auto p-2 rounded-lg shadow-md gap-1 flex flex-col space-y-2"
    >
      <h2 class="text-xl font-semibold mb-4 text-center">고치기</h2>
      <div class="flex gap-2 mb-2 items-end">
        <!-- 과목 -->
        <label class="form-control w-1/3">
          <span class="label-text text-xs">과목</span>
          <select name="subject" bind:value={quiz.subject} class="select w-fit text-xs" onchange={tag_save}>
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
          <div class="relative">
            <input
              name="topic"
              type="text"
              bind:value={quiz.topic}
              placeholder="주제 입력"
              class="input input-bordered w-full text-xs"
              onchange={tag_save}
            />
            {#if quiz.topic}
              <button
                type="button"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
                onclick={() => (quiz.topic = '')}
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
        </label>

        <!-- 난이도 선택 -->
        <label class="form-control w-1/3">
          <span class="label-text text-xs">난이도</span>
          <select
            name="difficulty"
            bind:value={quiz.difficulty}
            class="select select-bordered w-fit text-xs"
            onchange={tag_save}
          >
            {#each difficultyOptions as option}
              <option
                value={option.value}
                selected={option.value === quiz.difficulty}
                >{option.label}</option
              >
            {/each}
          </select>
        </label>
      </div>
      <!-- 문제 -->
      <label class="form-control w-full mb-2 flex flex-col">
        <span class="label-text text-xs">문제</span>
        <textarea name="question" class="textarea w-full" placeholder="문제" bind:value={quiz.question} onchange={tag_save}
          >{quiz.question}</textarea
        >
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
          onchange={tag_save}
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
            onchange={tag_save}
          />
        </label>
      {/each}

      <!-- 제출 버튼 -->
      <button
        class="btn btn-primary w-full"
        onclick={() => { onClose() }}
        type="button">닫 기</button
      >
    </div>
  </form>
</Modal>

<!-- {#if quiz.detail}
  <Modal autoClose={true}>
    <div class="alert alert-success shadow-lg">
      <div>
        <div class="flex gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="w-16 h-16 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {JSON.stringify(quiz, null, 2)}
        </div>
      </div>
    </div>
  </Modal>
{/if} -->

<!-- 
<Modal modal_open={loading} clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>
 -->
