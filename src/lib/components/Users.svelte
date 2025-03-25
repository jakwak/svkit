<script lang="ts" generics="User extends { id: number, username: string }">
  interface Props {
    users: User[]
  }
  let { users }: Props = $props()
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
  {#each users as user}
    <div
      class="bg-white shadow-lg rounded-2xl p-4 flex items-center justify-center text-lg font-semibold"
    >
      {user.username}
    </div>
  {/each}
</div>
