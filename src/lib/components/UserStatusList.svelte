<script lang="ts">
  import { appStore } from '$lib/appstore.svelte'
  import { ADMIN_USER } from '$lib/globals'
  
  const { users } = $props<{ users: User[] }>()
  
  // 선생님 제외하고 학생만 필터링
  const students = $derived(users.filter((user: User) => user.username !== ADMIN_USER))
  
  // 온라인 학생 수 계산
  const onlineStudents = $derived(students.filter((user: User) => appStore.isOnline(user.username)))
  
  // 현재 사용자가 온라인인지 확인하는 함
  const isUserOnline = (username: string) => {
    return appStore.isOnline(username)
  }
</script>

<div class="user-status-container">
  <div class="status-header">
    <span class="status-title">참가자들: {onlineStudents.length}/{students.length}명</span>
  </div>
  
  <div class="users-grid">
    {#each students as user}
      <div class="user-item {isUserOnline(user.username) ? 'online' : 'offline'}">
        <div class="user-avatar">
          <div class="avatar-circle">
            {user.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div class="status-indicator {isUserOnline(user.username) ? 'online' : 'offline'}"></div>
        </div>
        <div class="user-info">
          <span class="username">{user.username}</span>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- {#if students.length > 0}
    <div class="online-summary">
      <span class="online-count">{students.length}명 온라인</span>
    </div>
  {/if} -->
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

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(156, 163, 175, 0.2);
  }

  .status-title {
    font-weight: 600;
    font-size: 14px;
    color: #f9fafb;
  }

  .user-count {
    font-size: 12px;
    color: #d1d5db;
    background: rgba(75, 85, 99, 0.5);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
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
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
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
    margin-bottom: 4px;
  }

  .online-summary {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(156, 163, 175, 0.2);
    text-align: center;
  }

  .online-count {
    font-size: 12px;
    color: #22c55e;
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