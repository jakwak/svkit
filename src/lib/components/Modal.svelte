<script lang="ts">
  import { clickOutside } from '$lib/clickOutside'
  import { fade } from 'svelte/transition'

  interface Props {
    modal_open?: boolean
    modal_top?: boolean
    bgColor?: string
    clickOutsidable?: boolean
    onClose?: () => void
    children?: any
  }
  
  let {
    modal_open = false,
    modal_top = true,
    bgColor = 'bg-transparent',
    clickOutsidable = true,
    onClose = () => {},
    children,
  }: Props = $props()
</script>

<dialog
  id="dynamic_modal"
  class={['modal', modal_open && 'modal-open', modal_top ? 'modal-top' : 'modal-middle']}
>
  <div
    class={["modal-box max-w-2xl w-auto mx-auto p-5", bgColor]}
    use:clickOutside={() => modal_open && clickOutsidable && onClose()}
  >
    {@render children?.()}
  </div>
</dialog>
