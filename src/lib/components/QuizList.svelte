<script lang="ts">
  import { Modal } from '$lib'
  import AiQuiz from './AIQuiz.svelte'
  import QuizView from './QuizView.svelte'
  import type { ActionResult } from '@sveltejs/kit';

  let quizList = $state<QuizQuestion[]>([])

  // $effect(() => {
  //   if (quiz) {
  //     quizList = [...quizList, quiz]      
  //     // return () => {
  //     //   quizList = quizList.filter((item) => item !== quiz)
  //     // }
  //   }
  // })

  let loading = $state(false)

  function deleteQuiz(id: string) {
    console.log('deleteQuiz: ', id);   
    quizList = quizList.filter((item) => item.id !== id)
  }

</script>

<AiQuiz enhanced={() => {
  loading = true
  return async ({ result }: { result: ActionResult}) => {
    // await update()
    loading = false
    if (result.type === 'success') {
      quizList = [result.data?.quiz as QuizQuestion, ...quizList]
    }
  }
}} />

<Modal modal_open={loading} clickOutsidable={false} modal_top={false}>
  <span class="loading loading-spinner loading-xl"></span>
</Modal>

<div class="columns-1 sm:columns-2 gap-4">
  {#each quizList as quiz, i}
    <div class="mb-4 break-inside-avoid rounded-lg">
    <QuizView bind:quiz={quizList[i]} {deleteQuiz} />
  </div>
  {/each}
</div>
