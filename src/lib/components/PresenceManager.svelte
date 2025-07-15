<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
import { supabase, appStore, ADMIN_USER } from '$lib'

  let presenceChannel: any = null
  let heartbeatInterval: any = null
  let isTeacherOnline = $state(false)

  // 활동 상태 업데이트 함수
  const updateUserActivity = (activity: string) => {
    console.log('활동 상태 업데이트:', activity)
    if (presenceChannel) {
      const userStatus = {
        username: appStore.username,
        activity,
        online_at: new Date().toISOString(),
      }
      presenceChannel.track(userStatus)
    }
  }

  // 선생님에게 하트비트 보내기
  const sendHeartbeatToTeacher = () => {
    if (presenceChannel && isTeacherOnline) {
      const heartbeat = {
        from: appStore.username,
        timestamp: new Date().toISOString(),
        type: 'heartbeat'
      }
      
      presenceChannel.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: heartbeat
      })
      console.log('선생님에게 하트비트 전송:', heartbeat)
    }
  }

  // 하트비트 시작
  const startHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }
    
    // 30초마다 하트비트 전송
    heartbeatInterval = setInterval(() => {
      sendHeartbeatToTeacher()
    }, 30000)
    
    console.log('하트비트 시작 (30초 간격)')
  }

  // 하트비트 중지
  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
      console.log('하트비트 중지')
      appStore.logout()
    }
  }

  onMount(() => {
    // Supabase Presence 채널 생성
    presenceChannel = supabase.channel('user-status', {
      config: {
        presence: {
          key: appStore.username,
        },
      },
    })

    const userStatus = {
      username: appStore.username,
      activity: '온라인',
      online_at: new Date().toISOString(),
    }

    presenceChannel
      .on(
        'broadcast',
        { event: '*' }, // 모든 브로드캐스트 이벤트 수신
        (payload: any) => {
          if (payload.event === 'heartbeat_response' && payload.payload.to === appStore.username) {
            console.log('선생님으로부터 하트비트 응답 수신:', payload.payload)
          }

          if (payload.event === 'show_buttons') {
            appStore.sessionState = 'quiz'
            console.log('버튼 표시 이벤트 수신:', payload.payload)
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        console.log('Presence sync:', state)
        
        // 선생님이 온라인인지 확인
        const teacherPresent = Object.values(state).some((presence: any) => {
          if (Array.isArray(presence)) {
            return presence.some((p: any) => p.username === ADMIN_USER)
          }
          return presence.username === ADMIN_USER
        })
        
        isTeacherOnline = teacherPresent
        console.log('선생님 온라인 상태:', isTeacherOnline)
        
        // 선생님이 온라인이면 하트비트 시작
        if (isTeacherOnline && appStore.username !== ADMIN_USER) {
          startHeartbeat()
        } else {
          stopHeartbeat()
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
        console.log('사용자 접속:', key, newPresences)
        
        // 선생님이 접속했는지 확인
        const teacherJoined = newPresences.some((presence: any) => presence.username === ADMIN_USER)
        if (teacherJoined && appStore.username !== ADMIN_USER) {
          isTeacherOnline = true
          startHeartbeat()
          console.log('선생님 접속 - 하트비트 시작')
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
        console.log('사용자 퇴장:', key, leftPresences)
        
        // 선생님이 퇴장했는지 확인
        const teacherLeft = leftPresences.some((presence: any) => presence.username === ADMIN_USER)
        if (teacherLeft) {
          isTeacherOnline = false
          stopHeartbeat()
          console.log('선생님 퇴장 - 하트비트 중지')
        }
      })
      .subscribe(async (status: string) => {
        console.log('Presence 채널 상태:', status)
        if (status === 'SUBSCRIBED') {
          try {
            updateUserActivity('온라인')
          } catch (error) {
            console.error('사용자 상태 등록 오류:', error)
          }
        }
      })
  })

  onDestroy(async () => {
    stopHeartbeat()
    
    if (presenceChannel) {
      try {
        await presenceChannel.unsubscribe()
        console.log('사용자 상태 제거 완료')
      } catch (error) {
        console.error('사용자 상태 제거 오류:', error)
      }
    }
  })

  // 컴포넌트 외부에서 사용할 수 있도록 함수 노출
  $effect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).updateUserActivity = updateUserActivity
      ;(window as any).sendHeartbeatToTeacher = sendHeartbeatToTeacher
    }
  })
</script>

<!-- 이 컴포넌트는 UI를 렌더링하지 않고 백그라운드에서 Presence를 관리합니다 -->
