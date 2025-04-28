<script lang="ts">
  import { appStore } from "$lib"

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    // 방법 1. base64로 읽기 (간단)
    reader.readAsDataURL(file);
    reader.onload = () => {
      appStore.socket?.emit('upload_image', { 
        filename: file.name,
        data: reader.result
      });
    };

    // 방법 2. ArrayBuffer로 읽기 (조금 빠름)
    /*
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      socket.emit('upload_image', { 
        filename: file.name,
        data: arrayBuffer 
      });
    };
    */
  }

  function sendImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      appStore.socket?.emit('upload_image', { filename: file.name, data: base64 });
    };
    reader.readAsDataURL(file); // base64 변환
  }

  let container: HTMLDivElement;
  // 이미지 수신
  appStore.socket?.on('broadcast_image', (data) => {
    const { filename, data: imageData } = data;
    const img = new Image();
    img.src = imageData; // base64나 Blob이면 직접 쓸 수 있어
    container.appendChild(img); // container에 추가
  });
</script>

<input type="file" accept="image/*" on:change={handleFileChange} />

<input type="file" on:change={(e) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    sendImage(target.files[0]);
  }
}} />

<!-- 이미지를 여기에 추가 -->
<div bind:this={container} style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
  <p>이미지 표시 영역</p>
</div>