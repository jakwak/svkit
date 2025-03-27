<script lang="ts" generics="User extends { id: number, username: string }">
  interface Props {
    users: User[],
    online_users: string[]
  }
  let { users, online_users }: Props = $props()
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 max-w-2xl mx-auto">
  {#each  [...users].sort((a, b) => a.username.localeCompare(b.username)) as user}
    <div
      class={[
        "btn btn-soft btn-primary text-2xl h-15 font-medium border border-primary", 
        online_users.some(online_user => online_user === user.username) ? 'bg-secondary border-secondary text-white font-semibold' : ''
      ]}
    >
      {user.username}
    </div>
  {/each}
</div>
