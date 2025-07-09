<script lang="ts">
  import { appStore } from '$lib/appstore.svelte'
  
  export let users: any[] = []
  
  // 선생님 제외하고 학생만 필터링
  $: students = users.filter(user => !user.is_admin)
  $: onlineStudents = students.filter(user => user.is_online)
  $: offlineStudents = students.filter(user => !user.is_online)
</script>

<div class="user-status-container">
  <div class="status-header">
    <span class="status-title">학생 참여자</span>
    <span class="user-count">{students.length}명</span>
  </div>
  
  <div class="users-grid">
    {#each students as user}
      <div class="user-item {user.is_online ? 'online' : 'offline'}">
        <div class="user-avatar">
          <div class="avatar-circle">
            {user.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div class="status-indicator {user.is_online ? 'online' : 'offline'}"></div>
        </div>
        <div class="user-info">
          <span class="username">{user.username}</span>
        </div>
      </div>
    {/each}
  </div>
  
  {#if onlineStudents.length > 0}
    <div class="online-summary">
      <span class="online-count">{onlineStudents.length}명 온라인</span>
    </div>
  {/if}
</div>

<style>
  .user-status-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 100%;
    margin-bottom: 20px;
  }

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .status-title {
    font-weight: 600;
    font-size: 14px;
    color: #374151;
  }

  .user-count {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
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
    background: rgba(0, 0, 0, 0.05);
  }

  .user-item.online {
    background: rgba(34, 197, 94, 0.05);
  }

  .user-item.online:hover {
    background: rgba(34, 197, 94, 0.1);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .status-indicator.online {
    background: #22c55e;
    animation: pulse 2s infinite;
  }

  .status-indicator.offline {
    background: #9ca3af;
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
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  .status-badge {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 4px;
  }

  .status-badge.online {
    background: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }

  .status-badge.offline {
    background: #9ca3af;
    box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.2);
  }

  .online-summary {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
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
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  .users-grid::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  .users-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
</style> 