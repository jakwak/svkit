<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import UsernameButton from './UsernameButton.svelte'
  import { UserAnimationManager } from './UserAnimationManager'
  import { gsap } from 'gsap'
  import {
    ANIMATION_CONSTANTS,
    USER_CONSTANTS,
    Z_INDEX_CONSTANTS,
    BUTTON_CONSTANTS,
  } from '$lib/globals'

  const { users, userVariants } = $props<{
    users: User[]
    userVariants: Record<string, string>
  }>()

  const animationManager = new UserAnimationManager()
  
  // 외부에서 애니메이션 매니저에 접근할 수 있도록 전역 변수로 설정
  if (typeof window !== 'undefined') {
    ;(window as any).userAnimationManager = animationManager
  }

  onMount(() => {
    // 즉시 초기 상태 설정 (깜박 방지)
    gsap.set('.user-button-container', {
      opacity: 0,
      y: 0,
      scale: 1,
    })

    // 초기 fade-in 애니메이션
    setTimeout(() => {
      animationManager.fadeInButtons()

      // fade-in 애니메이션 완료 후 원래 위치 저장
      setTimeout(() => {
        const positions = animationManager.saveOriginalPositions()
        animationManager.initialize(positions)
      }, ANIMATION_CONSTANTS.POSITION_SAVE_DELAY)
    }, ANIMATION_CONSTANTS.FADE_IN_DELAY)

    // 리사이즈 이벤트 리스너 추가
    const handleResize = () => {
      // 모든 진행 중인 애니메이션 중단
      gsap.killTweensOf('.user-button-container')

      // 모든 사용자 버튼을 원래 위치로 즉시 리셋
      const userButtons = document.querySelectorAll('.user-button-container')
      userButtons.forEach((button) => {
        const element = button as HTMLElement
        if (element) {
          gsap.set(element, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1,
          })
        }
      })

      // arrivalOrder 초기화
      animationManager.resetArrivalOrder()

      // 모든 사용자의 answer_number를 0으로 리셋
      users.forEach((user: User) => {
        user.answer_number = USER_CONSTANTS.DEFAULT_ANSWER_NUMBER
      })

      // DOM 업데이트를 기다린 후 새로운 위치 계산
      setTimeout(() => {
        // 새로운 위치 계산 완료 후 애니메이션 매니저 완전 리셋
        animationManager.resetAfterResize()
      }, ANIMATION_CONSTANTS.RESIZE_TIMEOUT)
    }

    window.addEventListener('resize', handleResize)

    // onDestroy에서 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })



  onDestroy(() => {
    animationManager.destroy()
  })
</script>

<div class="mb-4">
  <div class="flex flex-wrap gap-2 justify-center user-buttons-wrapper">
    {#each users.filter((user: User) => user.username !== '') as user, index}
      {@const currentVariant =
        userVariants[user.username] || user.variant || 'gray'}
      <div class="user-button-container">
        <UsernameButton
          username={user.username}
          variant={currentVariant as any}
          size={BUTTON_CONSTANTS.DEFAULT_SIZE}
          onClick={() => {
            // 사용자 버튼 클릭 시 해당 사용자의 answer_number를 1-4 중 하나로 변경. 8초후 원래 위치로 돌아가게 하기
            // const randomNumber =
            //   Math.floor(
            //     Math.random() *
            //       (USER_CONSTANTS.RANDOM_ANSWER_MAX -
            //         USER_CONSTANTS.RANDOM_ANSWER_MIN +
            //         1)
            //   ) + USER_CONSTANTS.RANDOM_ANSWER_MIN
            // user.answer_number = randomNumber
            // animationManager.moveSingleUserToNumber(users, index, randomNumber)
            // setTimeout(() => {
            //   user.answer_number = USER_CONSTANTS.DEFAULT_ANSWER_NUMBER
            //   animationManager.moveSingleUserToOriginal(users, index)
            // }, ANIMATION_CONSTANTS.USER_CLICK_TIMEOUT)
          }}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .user-button-container {
    z-index: 1;
  }
</style>
