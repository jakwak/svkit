<script lang="ts">
  export let username: string
  export let onClick: (() => void) | undefined = undefined
  export let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'purple' | 'pink' | 'indigo' | 'teal' | 'orange' | 'lime' | 'cyan' | 'gray' = 'primary'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let disabled: boolean = false

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
    gray: 'bg-gray-500 text-white hover:bg-gray-600'
  }

  const sizeStyles = {
    small: 'px-1 py-0.5 text-xs font-thin',
    medium: 'px-2 py-1 text-lg font-thin',
    large: 'px-3 py-1.5 text-3xl font-thin'
  }

  function handleClick() {
    if (!disabled && onClick) {
      onClick()
    }
  }
</script>

<button
  class="
    inline-flex items-center justify-center
    rounded-none font-semibold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    {variantStyles[variant]}
    {sizeStyles[size]}
  "
  class:focus:ring-blue-500={variant === 'primary'}
  class:focus:ring-amber-700={variant === 'secondary'}
  class:focus:ring-green-500={variant === 'success'}
  class:focus:ring-yellow-500={variant === 'warning'}
  class:focus:ring-red-500={variant === 'danger'}
  class:focus:ring-purple-500={variant === 'purple'}
  class:focus:ring-pink-500={variant === 'pink'}
  class:focus:ring-indigo-500={variant === 'indigo'}
  class:focus:ring-teal-500={variant === 'teal'}
  class:focus:ring-orange-500={variant === 'orange'}
  class:focus:ring-lime-500={variant === 'lime'}
  class:focus:ring-cyan-500={variant === 'cyan'}
  {disabled}
  on:click={handleClick}
>
  {username}
</button> 