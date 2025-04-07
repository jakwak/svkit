<script>
  let { size = 32, color = 'currentColor', left = true } = $props()
</script>

{#if left}
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 왼쪽 방향 삼각형 -->
    <polygon points="10,50 90,10 90,90" fill={color} />
  </svg>
{:else}
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 오른쪽 방향 삼각형 -->
    <polygon points="90,50 10,10 10,90" fill={color} />
  </svg>
{/if}
