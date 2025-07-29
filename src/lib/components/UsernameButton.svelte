<script lang="ts">
  const {
    username,
    onClick = undefined,
    variant = $bindable('primary'),
    size = 'medium',
    disabled = false,
  } = $props<{
    username: string
    onClick?: () => void
    variant?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger'
      | 'purple'
      | 'pink'
      | 'indigo'
      | 'teal'
      | 'orange'
      | 'lime'
      | 'cyan'
      | 'gray'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }>()

  // 타입 안전성을 위한 타입 단언 - 반응형으로 업데이트
  const variantValue = $derived(variant as keyof typeof variantStyles)
  const sizeValue = $derived(size as keyof typeof sizeStyles)

  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-amber-700 text-white hover:bg-amber-800',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    purple: 'bg-purple-500 text-white hover:bg-purple-600',
    pink: 'bg-pink-500 text-white hover:bg-pink-600',
    indigo: 'bg-indigo-500 text-white hover:bg-indigo-600',
    teal: 'bg-teal-500 text-white hover:bg-teal-600',
    orange: 'bg-orange-500 text-white hover:bg-orange-600',
    lime: 'bg-lime-500 text-white hover:bg-lime-600',
    cyan: 'bg-cyan-500 text-white hover:bg-cyan-600',
    gray: 'bg-gray-500 text-white hover:bg-gray-600',
  }

  const sizeStyles = {
    small: 'px-1 py-0.5 text-xs font-thin',
    medium: 'px-2 py-1 text-lg font-thin',
    large: 'px-3 py-1.5 text-3xl font-thin',
  }

  function handleClick() {
    if (!disabled && onClick) {
      onClick()
    }
  }
</script>

<style>
  button {
    /* 모든 버튼이 동일한 너비를 가지도록 설정 */
    min-width: 80px !important;
    width: 80px !important;
    height: 40px !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
</style>

<button
  class="
    inline-flex items-center justify-center
    rounded-none font-semibold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    min-w-[80px] w-[80px] h-[40px]
    {variantStyles[variantValue]}
    {sizeStyles[sizeValue]}
  "
  class:focus:ring-blue-500={variantValue === 'primary'}
  class:focus:ring-amber-700={variantValue === 'secondary'}
  class:focus:ring-green-500={variantValue === 'success'}
  class:focus:ring-yellow-500={variantValue === 'warning'}
  class:focus:ring-red-500={variantValue === 'danger'}
  class:focus:ring-purple-500={variantValue === 'purple'}
  class:focus:ring-pink-500={variantValue === 'pink'}
  class:focus:ring-indigo-500={variantValue === 'indigo'}
  class:focus:ring-teal-500={variantValue === 'teal'}
  class:focus:ring-orange-500={variantValue === 'orange'}
  class:focus:ring-lime-500={variantValue === 'lime'}
  class:focus:ring-cyan-500={variantValue === 'cyan'}
  {disabled}
  onclick={handleClick}
>
  {username}
</button>
