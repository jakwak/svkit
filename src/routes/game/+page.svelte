<script lang="ts">
  import { appStore } from "$lib";
  import GameFrame from "$lib/components/GameFrame.svelte";

  let username = appStore.username;
</script>

<GameFrame {username} />