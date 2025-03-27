<script>
  import { onDestroy } from "svelte";

  let time = new Date().toLocaleString(); // toLocaleTimeString(); // 현재 시간 가져오기
  let interval;

  function updateTime() {
    time = new Date().toLocaleString();; // 초 단위 갱신
  }

  // 1초마다 시간 업데이트
  interval = setInterval(updateTime, 1000);

  // 컴포넌트가 제거될 때 clearInterval 실행
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="text-sm">
  {time}
</div>