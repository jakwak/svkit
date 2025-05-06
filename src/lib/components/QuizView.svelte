<script lang="ts">
  import {
  appStore,
    difficultyOptions,
    sumOfAllAnswerLengths,
    TagSave,
  } from '$lib'
  import Markdown from './Markdown.svelte'
  import QInput from './QInput.svelte'
  import { enhance } from '$app/forms'
  import type { ActionResult } from '@sveltejs/kit'

  let { quiz = $bindable({}), deleteQuiz = () => {}, wsNum = 0, wsID = null} = $props()

  let edit = $state(false)
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
      <span class="text-zinc-400 text-xs underline">
        {quiz.topic}({difficultyOptions[quiz.difficulty - 1].label}) {wsNum > 0 ? `#${quiz.id}` : ''}
      </span>
    </div>
    <div class="text-sm text-justify mt-5 flex font-thin items-baseline">
      <span class="text-lg font-semibold">
      {#if wsNum === 0}
        {quiz.id ? `#${Number.isInteger(quiz.id) ? quiz.id : '?'}` : '#?'}.
      {:else}
        {wsNum}.
      {/if}
      </span>
      &nbsp; <Markdown content={quiz.question} />
    </div>
    <ul
      class={[
        'text-sm',
        sumOfAllAnswerLengths(quiz.correctAnswer, quiz.wrongAnswers) > 15
          ? 'flex flex-col'
          : 'flex flex-wrap justify-evenly gap-2',
      ]}
    >
      {#each [quiz.correctAnswer, ...quiz.wrongAnswers] as item, index}
        <li
          class={[
            'p-1 pl-5 rounded-lg text-left flex font-light',
            item === quiz.correctAnswer && 'text-secondary font-medium',
          ]}
        >
          {#if index === 0}①&nbsp;{/if}
          {#if index === 1}②&nbsp;{/if}
          {#if index === 2}③&nbsp;{/if}
          {#if index === 3}④&nbsp;{/if}
          <Markdown content={item} />
        </li>
      {/each}
    </ul>
    {#if !edit}
      <div class="flex justify-center items-baseline">
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
            deleteQuiz(quiz)
          }}
          type="button">지우기</button
        >
        <form
          method="POST"
          action="?/saveQuiz"
          use:enhance={() => {
            return async ({ result }: { result: ActionResult }) => {
              if (result.type === 'success') {
                if (result.data?.save) {
                  quiz.id = result.data.quiz.id
                }
                quiz.save = TagSave.SAVED
                // invalidateAll()
              }
            }
          }}
        >
          <input type="hidden" name="quiz" value={JSON.stringify(quiz)} />
          <input type="hidden" name="wsID" value={wsID} />
          <button
            type="submit"
            class="btn btn-primary btn-xs btn-ghost {quiz.save === TagSave.SAVED
              ? ''
              : 'text-info'}"
            disabled={quiz.save === TagSave.SAVED}>저장하기</button
          >
        </form>
        <button
          class="btn btn-primary btn-xs btn-ghost"
          onclick={() => {
            // const payload = JSON.stringify(quiz)
            appStore.sendQuiz(quiz as QuizQuestion)
          }}          
          disabled={appStore.users.length === 1}
          type="button">보내기</button
        >
      </div>
    {/if}
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
