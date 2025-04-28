// src/lib/useImageSocket.ts
import { onMount, onDestroy } from 'svelte';
import type { Socket } from 'socket.io-client';

interface UseImageSocketOptions {
  socket: Socket;
  container: HTMLDivElement | null;
}

export function useImageSocket({ socket, container }: UseImageSocketOptions) {
  function handleBroadcastImage(data: { filename: string; data: string | ArrayBuffer }) {
    if (!container) {
      console.error('❌ container가 준비 안 됨');
      return;
    }

    const { filename, data: imageData } = data;
    const wrapper = document.createElement('div'); // 감싸는 div (애니메이션용)
    const img = new Image();

    if (typeof imageData === 'string') {
      img.src = imageData; // base64
    } else if (imageData instanceof ArrayBuffer) {
      const blob = new Blob([imageData]);
      img.src = URL.createObjectURL(blob); // ArrayBuffer → Blob 변환
    } else {
      console.error('❌ 알 수 없는 데이터 타입');
      return;
    }

    img.alt = filename;
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    img.style.marginBottom = '10px';

    wrapper.appendChild(img);
    wrapper.style.opacity = '0';
    wrapper.style.transition = 'opacity 1s ease';

    container.appendChild(wrapper);

    // 약간 늦게 opacity 조정해서 부드럽게 등장
    requestAnimationFrame(() => {
      wrapper.style.opacity = '1';
    });
  }

  onMount(() => {
    socket.on('broadcast_image', handleBroadcastImage);
  });

  onDestroy(() => {
    socket.off('broadcast_image', handleBroadcastImage);
  });
}
