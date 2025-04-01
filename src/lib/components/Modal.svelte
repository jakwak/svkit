<script lang="ts">
  import { clickOutside } from '$lib/clickOutside'

  interface Props {
    modal_open?: boolean
    modal_top?: boolean
    bgColor?: string
    clickOutsidable?: boolean
    autoClose?: boolean
    onClose?: () => void
    children?: any
  }

  let {
    modal_open = true,
    modal_top = true,
    bgColor = 'bg-transparent',
    clickOutsidable = true,
    autoClose = false,
    onClose = () => {},
    children,
  }: Props = $props()

  $effect(() => {
    if (modal_open && autoClose) {
      setTimeout(() => {
        modal_open = false        
      }, 3000)
    }
  })
</script>

<dialog
  id="dynamic_modal"
  class={[
    'modal',
    modal_open && 'modal-open',
    modal_top ? 'modal-top' : 'modal-middle',
  ]}
>
  <div
    class={['modal-box max-w-2xl w-auto mx-auto p-5', bgColor]}
    use:clickOutside={() => {modal_open && clickOutsidable && onClose()}}
  >
    {@render children?.()}
  </div>
</dialog>
