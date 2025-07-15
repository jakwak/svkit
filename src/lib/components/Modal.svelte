<script lang="ts">
  import { clickOutside } from '$lib'

  interface Props {
    modal_open?: boolean
    modal_top?: boolean
    bgColor?: string
    clickOutsidable?: boolean
    autoClose?: number
    width?: string
    onClose?: () => void
    children?: any
  }

  let {
    modal_open = $bindable(false),
    modal_top = true,
    bgColor = 'bg-transparent',
    clickOutsidable = true,
    autoClose = 0,
    onClose = () => {},
    width = 'w-auto',
    children,
  }: Props = $props()

  $effect(() => {
    if (modal_open && autoClose > 0) {
      setTimeout(() => {
        modal_open = false        
      }, autoClose)
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
    class={['modal-box max-w-5xl mx-auto p-2 rounded-md', width, bgColor]}
    use:clickOutside={() => {modal_open && clickOutsidable && onClose()}}
  >
    {@render children?.()}
  </div>
</dialog>
