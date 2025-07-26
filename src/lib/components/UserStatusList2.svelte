<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { supabase, appStore, ADMIN_NAME, type User } from '$lib'

  const { users } = $props<{ users: User[] }>()

  // 선생님 제외하고 학생만 필터링
  const students = $derived(users.filter((user: User) => user.username !== ADMIN_NAME))
  
  // Supabase Presence 상태
  let presenceChannel: any = null
  let onlineUsers = $state<Set<string>>(new Set())
  let userActivities = $state<Map<string, string>>(new Map())

  // 온라인 학생 수 계산
  const onlineStudents = $derived(students.filter((user: User) => onlineUsers.has(user.username)))

  // 현재 사용자가 온라인인지 확인하는 함수
  const isUserOnline = (username: string) => {
    return onlineUsers.has(username)
  }

  // 사용자 활동 상태 가져오기
  const getUserActivity = (username: string) => {
    return userActivities.get(username) || '온라인'
  }

  // 이름 부분만 추출하는 함수 (성 제외)
  const getNamePart = (username: string) => {
    if (!username) return '?'
    
    // 이름이 2글자 이상이면 2번째 글자부터, 아니면 첫 글자
    if (username.length >= 2) {
      return username.substring(1).toUpperCase()
    } else {
      return username.charAt(0).toUpperCase()
    }
  }

  // 사용자별 아바타 색상과 글자색 결정 함수
  const getAvatarStyle = (username: string, index: number, isOnline: boolean) => {
    if (!username) return { background: '#667eea', color: 'white' }
    
    const colorSchemes = [
      { background: '#3b82f6', color: 'white' },      // 파랑
      { background: '#ef4444', color: 'white' },      // 빨강
      { background: '#10b981', color: 'white' },      // 초록
      { background: '#f59e0b', color: 'white' },      // 주황
      { background: '#8b5cf6', color: 'white' },      // 보라
      { background: '#ec4899', color: 'white' },      // 분홍
      { background: '#06b6d4', color: 'white' },      // 청록
      { background: '#84cc16', color: 'white' },      // 연두
      { background: '#f97316', color: 'white' },      // 주황
      { background: '#6366f1', color: 'white' },      // 인디고
      { background: '#14b8a6', color: 'white' },      // 틸
      { background: '#f43f5e', color: 'white' }       // 로즈
    ]
    
    // 인덱스 기반으로 색상 선택 (12개 색상이 반복됨)
    const colorIndex = index % colorSchemes.length
    
    if (isOnline) {
      // 온라인일 때는 컬러 표시
      return colorSchemes[colorIndex]
    } else {
      // 오프라인일 때는 어두운 회색
      return { background: '#6b7280', color: 'white' }
    }
  }

  onMount(() => {
    const initializePresence = () => {
    // Supabase Presence 채널 생성 - 모든 페이지에서 같은 채널명 사용
    presenceChannel = supabase.channel('user-status')

    // Presence 이벤트 리스너 등록
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        console.log('Presence sync:', state)
        updateOnlineUsers(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
        console.log('사용자 접속:', key, newPresences)
        newPresences.forEach((presence: any) => {
          onlineUsers.add(presence.username)
          userActivities.set(presence.username, presence.activity || '온라인')
        })
        onlineUsers = new Set(onlineUsers)
        userActivities = new Map(userActivities)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
        console.log('사용자 퇴장:', key, leftPresences)
        leftPresences.forEach((presence: any) => {
          onlineUsers.delete(presence.username)
          userActivities.delete(presence.username)
        })
        onlineUsers = new Set(onlineUsers)
        userActivities = new Map(userActivities)
      })
      .on('broadcast', { event: 'heartbeat' }, (payload: any) => {
        // 선생님만 하트비트 응답
        if (appStore.username === ADMIN_NAME) {
          console.log('하트비트 수신:', payload)
          sendHeartbeatResponse(payload.payload.from)
        }
      })
      .subscribe(async (status: string) => {
        console.log('Presence 채널 상태:', status)
        if (status === 'SUBSCRIBED') {
          try {
            updateActivity('온라인')
          } catch (error) {
            console.error('사용자 상태 등록 오류:', error)
          }
        }
      }
        
      )
    }

    initializePresence()

    return async () => {
      if (presenceChannel) {
        await presenceChannel.unsubscribe()
        console.log('Presence 채널 구독 해제 완료')
      }
    }
  })

    // 브로드캐스트 전송 함수들
    const sendBroadcast = async (event: string, payload: any) => {
    if (presenceChannel) {
      try {
        await presenceChannel.send({
          type: 'broadcast',
          event: event,
          payload: payload
        })
        console.log(`브로드캐스트 전송 완료: ${event}`, payload)
      } catch (error) {
        console.error('브로드캐스트 전송 오류:', error)
      }
    }
  }

  // 하트비트 응답 함수 (선생님만)
  const sendHeartbeatResponse = async (to: string) => {
    if (presenceChannel && appStore.username === ADMIN_NAME) {
      const response = {
        to: to,
        from: ADMIN_NAME,
        timestamp: new Date().toISOString(),
        type: 'heartbeat_response'
      }
      
      await presenceChannel.send({
        type: 'broadcast',
        event: 'heartbeat_response',
        payload: response
      })
      console.log('하트비트 응답 전송:', response)
    }
  }

    // 컴포넌트 외부에서 사용할 수 있도록 함수 노출
    $effect(() => {
    if (typeof window !== 'undefined') {
      (window as any).sendBroadcast = sendBroadcast
    }
  })

  // 온라인 사용자 목록 업데이트
  const updateOnlineUsers = (state: any) => {
    const newOnlineUsers = new Set<string>()
    const newUserActivities = new Map<string, string>()

    Object.values(state).forEach((presence: any) => {
      if (Array.isArray(presence)) {
        presence.forEach((p: any) => {
          newOnlineUsers.add(p.username)
          newUserActivities.set(p.username, p.activity || '온라인')
        })
      } else {
        newOnlineUsers.add(presence.username)
        newUserActivities.set(presence.username, presence.activity || '온라인')
      }
    })

    onlineUsers = newOnlineUsers
    userActivities = newUserActivities
  }

  // 활동 상태 업데이트 함수 (외부에서 호출 가능)
  const updateActivity = async (activity: string) => {
    if (presenceChannel) {
      const userStatus = {
        username: appStore.username,
        activity: activity,
        online_at: new Date().toISOString()
      }
      await presenceChannel.track(userStatus)
    }
  }

  // 컴포넌트 외부에서 사용할 수 있도록 함수 노출
  $effect(() => {
    if (typeof window !== 'undefined') {
      (window as any).updateUserActivity = updateActivity
    }
  })
</script>

<div class="user-status-container">
  <!-- <div class="status-header">
    <span class="status-title">참가자들: {onlineStudents.length}/{students.length}명</span>
    <span class="status-subtitle">Supabase Presence</span>
  </div> -->
  
  <div class="users-grid">
    {#each students as user, index}
      {@const avatarStyle = getAvatarStyle(user.username, index, isUserOnline(user.username))}
      <div class="user-item {isUserOnline(user.username) ? 'online' : 'offline'}">
        <div class="user-avatar">
          <div 
            class="avatar-circle" 
            style="background: {avatarStyle.background}; color: {avatarStyle.color};"
          >
            {getNamePart(user.username)}
          </div>
          <div class="status-indicator {isUserOnline(user.username) ? 'online' : 'offline'}"></div>
        </div>
        <div class="user-info">
          <span class="username">{user.username}</span>
          {#if isUserOnline(user.username)}
            <span class="activity">{getUserActivity(user.username)}</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .user-status-container {
    background: rgba(31, 41, 55, 0.95);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    width: 100%;
    margin-bottom: 8px;
  }
  
  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
    width: 100%;
    min-height: 0;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    min-height: 52px;
    width: 100%;
    box-sizing: border-box;
  }

  .user-item:hover {
    background: rgba(156, 163, 175, 0.1);
  }

  .user-item.online {
    background: rgba(34, 197, 94, 0.1);
  }

  .user-item.online:hover {
    background: rgba(34, 197, 94, 0.15);
  }

  .user-item.offline {
    background: rgba(75, 85, 99, 0.1);
  }

  .user-item.offline:hover {
    background: rgba(75, 85, 99, 0.15);
  }

  .user-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .avatar-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }

  .status-indicator.online {
    background: #22c55e;
    animation: pulse 2s infinite;
  }

  .status-indicator.offline {
    background: #6b7280;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .username {
    font-weight: 600;
    font-size: 14px;
    color: #f9fafb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .activity {
    font-size: 11px;
    color: #10b981;
    font-weight: 500;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }

  /* 스크롤바 스타일링 */
  .users-grid::-webkit-scrollbar {
    width: 4px;
  }

  .users-grid::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.2);
    border-radius: 2px;
  }

  .users-grid::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.4);
    border-radius: 2px;
  }

  .users-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6);
  }
</style>