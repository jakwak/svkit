<script lang="ts">
  import { toast } from '@zerodevx/svelte-toast'
  import AiQuizStream from './AIQuizStream.svelte'
  import { onMount, setContext } from 'svelte'
  import { invalidateAll } from '$app/navigation'
  

  let page = $state(1)
  let totalPages: null | number = $state(null)

  interface Worksheet {
    id: number
    title: string
    description: string
    questions: QuizQuestion[]
  }

  let worksheets: Worksheet[] = $state([])
  let curWorksheet: Worksheet | null = $state(null)

  onMount(async () => {
    try {
      const response = await fetch('/api/worksheets')
      if (!response.ok) throw new Error('Failed to fetch worksheets')
      const res = await response.json()
      worksheets = res.items.reverse()      
      totalPages = totalPages ?? res.pages
    } catch (error) {
      console.error('Error fetching worksheets:', error)
    }
  })

  async function deleteWorksheet(id: number) {
    try {
      const response = await fetch(`/api/worksheets/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete worksheet')
      worksheets = worksheets.filter((worksheet) => worksheet.id !== id)
      if (curWorksheet?.id === id) curWorksheet = null
      toast.push('문제집이 삭제되었습니다.')
      // invalidateAll()
    } catch (error) {
      console.error('Error deleting worksheet:', error)
    }
  }
</script>

<div class="flex flex-wrap gap-4 p-1 mx-auto w-full justify-center">
  {#each worksheets as worksheet}
    <div
      class="card bg-base-300 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-1 border-zinc-500 relative group hover:cursor-pointer hover:bg-base-100 w-[9rem]"
      onclick={() => (curWorksheet = curWorksheet?.id === worksheet.id ? null : worksheet)}
      onkeydown={(e) => e.key === 'Enter' && (curWorksheet = worksheet)}
      role="button"
      tabindex="0"
    >
      <button
        class="absolute text-xs top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-500 hover:text-gray-300"
        onclick={() => deleteWorksheet(worksheet.id)}
      >
        ✕
      </button>
      <div class="card-body flex items-center justify-center text-center py-3">
        <h2
          class={[
            'card-title text-xs text-wrap',
            curWorksheet?.id === worksheet.id && 'text-info',
          ]}
        >
          {worksheet.title
            .split('-')
            .map((part) => part.trim())
            .join('\n')}
        </h2>
        <p hidden={worksheet.description === ''} class="text-xs text-gray-400">
          {worksheet.description}
        </p>
      </div>
    </div>
  {/each}
</div>

<div class="tabs tabs-border flex justify-center mx-auto">
  {#if curWorksheet}
    <input
      type="radio"
      name="my_tabs2"
      class="tab hover:text-secondary text-xs items-end pb-2 h-fit w-full max-w-xs text-info"
      aria-label={(curWorksheet as Worksheet).title}
      checked={true}
    />
    <div class="tab-content bg-zinc-900 p-5 space-y-4">
      <AiQuizStream id={curWorksheet.id} />
    </div>
  {:else}
    <input
    type="radio"
    name="my_tabs2"
    class="tab hover:text-secondary items-end pb-2 h-fit w-fit max-w-xs"
    aria-label="새 문제지"
    checked={!curWorksheet}
    />
    <div class="tab-content bg-zinc-900 p-5 space-y-4">
      <AiQuizStream bind:worksheets bind:curWorksheet />
    </div>
  {/if}
</div>
