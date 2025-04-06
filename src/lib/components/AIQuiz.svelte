<script>
  import { enhance } from '$app/forms'
  import { difficultyOptions } from '$lib/globals'

  let { enhanced } = $props()

  let topic = $state('')
</script>

<form
  method="POST"
  action="?/aiquiz"
  use:enhance={enhanced}
  class="w-full max-w-2xl mx-auto flex flex-col"
>
  <div class="flex gap-2 mb-2 items-end">
    <select name="subject" class="select w-fit text-xs border-primary">
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
        type="submit"
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

    <select name="difficulty" class="select select-bordered w-fit text-xs  border-primary" value="3">
      {#each difficultyOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>

    <button
      class="btn btn-secondary"
      type="submit"
      name="ai_question">AI 출제</button
    >
  </div>
</form>