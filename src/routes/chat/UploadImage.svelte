<script lang="ts">
  import { appStore } from '$lib'
  import { onMount } from 'svelte'
  import { useImageSocket } from './useImageSocket'

  function handleFileChange(event: Event) {
    if (container === null) {
      alert('container가 아직 준비 안됨')
      return
    }

    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    // 방법 1. base64로 읽기 (간단)
    // reader.readAsDataURL(file);
    // reader.onload = () => {
    //   appStore.socket?.emit('upload_image', {
    //     filename: file.name,
    //     data: reader.result
    //   });
    // };

    // 방법 2. ArrayBuffer로 읽기 (조금 빠름)

    reader.readAsArrayBuffer(file)
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      appStore.socket?.emit('upload_image', {
        filename: file.name,
        data: arrayBuffer,
      })
    }
  }

  function sendImage(file: File) {
    if (container === null) {
      alert('container가 아직 준비 안됨')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      appStore.socket?.emit('upload_image', {
        filename: file.name,
        data: base64,
      })
    }
    reader.readAsDataURL(file) // base64 변환
  }

  let container = $state() as HTMLDivElement
  // 이미지 수신

  $effect(() => {
    if (appStore.socket && container) {
      useImageSocket({socket: appStore.socket, container})
    }
  })
</script>

ArrayBuffer로 읽기 --->
<input type="file" accept="image/*" onchange={handleFileChange} />

Base64로 읽기 --->
<input
  type="file"
  onchange={(e) => {
    const target = e.target as HTMLInputElement
    if (target.files) {
      sendImage(target.files[0])
    }
  }}
/>

<!-- 이미지를 여기에 추가 -->
<div
  bind:this={container}
  style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;"
>
  <p>이미지 표시 영역</p>
</div>
