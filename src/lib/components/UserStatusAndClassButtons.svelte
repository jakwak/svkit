<script lang="ts">
  import UserStatusList2 from './UserStatusList2.svelte';
  import ClassButtons from './ClassButtons.svelte';
  export let users: any[]
  export let color: boolean
</script>

<UserStatusList2 users={users} />
<ClassButtons color={color} /> 