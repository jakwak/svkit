<script lang="ts">
  import { clickOutside } from '$lib/clickOutside'

  interface Props {
    modal_open?: boolean
    bgColor?: string
    clickOutsidable?: boolean
    onClose: () => void
    children?: any
  }
  
  let {
    modal_open = false,
    bgColor = 'bg-transparent',
    clickOutsidable = true,
    onClose,
    children,
  }: Props = $props()
</script>

<dialog
  id="dynamic_modal"
  class={['modal modal-top', modal_open && 'modal-open']}
>
  <div
    class={["modal-box max-w-2xl w-auto mx-auto p-5", bgColor]}
    use:clickOutside={() => modal_open && clickOutsidable && onClose()}
  >
    {@render children?.()}
  </div>
</dialog>
