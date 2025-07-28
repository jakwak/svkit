<script lang="ts">
  import { 
    ADMIN_NAME, 
    appStore, 
    QuizShow, 
    XYInputText, 
    GameFrame, 
    MainMenu, 
    WaitingScreen, 
    NumberButtons, 
    PresenceManager 
  } from '$lib'
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import KidsRoom from '$lib/components/KidsRoom.svelte'

  const { data }: PageProps = $props()
  const { username, currentUser } = data
  
  onMount(() => {
    // 자동 로그인 상태 복원
    appStore.restoreAutoLoginState()
    
    if (currentUser) {
      appStore.connect(currentUser)
      console.log('✅ 퀴즈 페이지 사용자 연결:', currentUser.username)
    }

    // 뒤로가기 이벤트 핸들러 설정
    const cleanupBackHandler = appStore.setupBackButtonHandler()

    return () => {
      // 클린업 함수 실행
      if (cleanupBackHandler) cleanupBackHandler()
      appStore.logout()
    }
  })

  // currentUser 변경 시 즉시 반영
  $effect(() => {
    if (currentUser && currentUser.username !== appStore.username) {
      appStore.connect(currentUser)
      console.log('✅ 퀴즈 페이지 사용자 상태 업데이트:', currentUser.username)
    }
  })
</script>

<KidsRoom {username} />