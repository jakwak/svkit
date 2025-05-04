<script>

  import AiQuizStream from "./AIQuizStream.svelte"

</script>
<div class="tabs tabs-border flex justify-center mx-auto">
  <input
    type="radio"
    name="my_tabs2"
    class="tab hover:text-secondary text-xs items-end pb-2 h-fit"
    aria-label="문제지 1"
    checked={true}
  />
  <div class="tab-content border-1 bg-zinc-900 p-5 space-y-4">
    <AiQuizStream />
  </div>
  
  <!-- <input
    type="radio"
    name="my_tabs2"
    class="tab hover:text-secondary text-xs items-end pb-2"
    aria-label="문제지 2"
  />
  <div class="tab-content border-1 bg-zinc-900 p-5 space-y-4">
    <AiQuizStream />
  </div> -->
</div>