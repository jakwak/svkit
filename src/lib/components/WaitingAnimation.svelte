<script lang="ts">
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'

  let container: HTMLElement
  let currentMessageIndex = 0
  
  // 교훈적인 속담과 격언들 (100개)
  const messages = [
    "천리길도 한 걸음부터 🚶‍♂️",
    "서두르면 늦고, 천천히 가면 빨리 간다 ⏰",
    "작은 일에도 최선을 다하자 💪",
    "인내는 쓰지만 그 열매는 달다 🍎",
    "실패는 성공의 어머니 👩‍👧",
    "노력하는 자에게는 기회가 온다 🎯",
    "지혜는 나이보다는 경험에서 온다 🧠",
    "작은 진전도 큰 성취의 시작 🌱",
    "시간은 금이다 ⏳",
    "배움에는 끝이 없다 📚",
    "정직이 최선의 정책이다 🤝",
    "작은 실수도 큰 교훈이 된다 📝",
    "인내는 모든 것을 이긴다 🏆",
    "지혜로운 자는 조용히 기다린다 🤫",
    "노력은 결코 배신하지 않는다 💎",
    "작은 일에도 감사하자 🙏",
    "성공의 비밀은 꾸준함에 있다 🔄",
    "지혜는 침묵에서 온다 🤐",
    "인내는 쓰지만 그 열매는 달다 🍯",
    "작은 진전도 큰 성취의 시작 🌟",
    "시간은 가장 소중한 자산이다 💰",
    "배움은 평생의 여행이다 🧳",
    "정직한 노력은 결코 헛되지 않는다 ⭐",
    "작은 실수도 큰 교훈이 된다 📖",
    "인내는 모든 것을 이긴다 🥇",
    "지혜로운 자는 조용히 기다린다 🧘‍♂️",
    "노력은 결코 배신하지 않는다 💪",
    "작은 일에도 감사하자 🙌",
    "성공의 비밀은 꾸준함에 있다 🔄",
    "지혜는 침묵에서 온다 🤫",
    "인내는 쓰지만 그 열매는 달다 🍎",
    "작은 진전도 큰 성취의 시작 🌱",
    "시간은 가장 소중한 자산이다 ⏰",
    "배움은 평생의 여행이다 🚶‍♀️",
    "정직한 노력은 결코 헛되지 않는다 ✨",
    "작은 실수도 큰 교훈이 된다 📚",
    "인내는 모든 것을 이긴다 🏅",
    "지혜로운 자는 조용히 기다린다 🧘‍♀️",
    "말보다는 행동이 중요하다 🎭",
    "겸손은 최고의 덕목이다 🙇‍♂️",
    "용기는 두려움을 이긴다 🦁",
    "진실은 언젠가 밝혀진다 💡",
    "친구는 제2의 가족이다 👨‍👩‍👧‍👦",
    "건강이 최고의 재산이다 💪",
    "희망은 마지막까지 버리지 말자 🌈",
    "사랑은 모든 것을 이긴다 ❤️",
    "용서는 자신을 위한 선물이다 🎁",
    "감사는 행복의 열쇠이다 🔑",
    "꿈은 현실이 될 수 있다 🌟",
    "자신을 믿어라 💫",
    "변화는 성장의 시작이다 🦋",
    "평화는 마음에서 온다 🕊️",
    "지식은 힘이다 💪",
    "행복은 선택이다 😊",
    "성공은 준비된 자의 것이다 🎯",
    "실수는 배움의 기회이다 📚",
    "인간은 사회적 동물이다 👥",
    "자연은 최고의 스승이다 🌿",
    "음악은 영혼의 언어이다 🎵",
    "예술은 삶을 아름답게 한다 🎨",
    "운동은 건강의 비결이다 🏃‍♂️",
    "독서는 마음의 양식이다 📖",
    "여행은 마음을 넓힌다 ✈️",
    "요리는 사랑의 표현이다 👨‍🍳",
    "정원은 마음의 거울이다 🌸",
    "동물은 인간의 친구이다 🐕",
    "하늘은 무한한 가능성을 담고 있다 ☁️",
    "바다는 깊은 지혜를 담고 있다 🌊",
    "산은 높은 이상을 보여준다 ⛰️",
    "강물은 끊임없이 흘러간다 🌊",
    "나무는 뿌리가 튼튼해야 한다 🌳",
    "가는 말이 고와야 오는 말이 곱다 💬",
    "고래 싸움에 새우 등 터진다 🐋",
    "공든 탑이 무너지랴 🗼",
    "구슬이 서 말이라도 꿰어야 보배다 💎",
    "금강산도 식후경이다 🏔️",
    "낫 놓고 기역자도 모른다 📝",
    "남의 떡이 더 커 보인다 🍰",
    "낮말은 새가 듣고 밤말은 쥐가 듣는다 🐦",
    "내 코가 석 자다 👃",
    "누워서 떡 먹기다 🍡",
    "다 된 밥에 재 뿌리기다 🍚",
    "달면 삼키고 쓰면 뱉는다 😋",
    "돌다리도 두들겨보고 건너라 🌉",
    "동문서답이다 🚪",
    "등잔 밑이 어둡다 💡",
    "똥 묻은 개가 겨 묻은 개 나무란다 🐕",
    "마른 하늘에 날벼락이다 ⚡",
    "말 한마디에 천 냥 빚도 갚는다 💰",
    "모로 가도 서울만 가면 된다 🏛️",
    "바늘 도둑이 소도둑 된다 🧵",
    "백지장도 맞들면 낫다 📄",
    "벼는 익을수록 고개를 숙인다 🌾",
    "사공이 많으면 배가 산으로 간다 🚣‍♂️",
    "새 발의 피다 🦶",
    "소 잃고 외양간 고친다 🐄",
    "수박 겉 핥기다 🍉",
    "시작이 반이다 🚀",
    "아는 길도 물어가라 🗺️",
    "아침 공복에 먹는 사과는 금이다 🍎",
    "어깨 넘어로 본다 👀",
    "열 길 물속은 알아도 한 길 사람 속은 모른다 🌊",
    "오르지 못할 나무는 쳐다보지도 말라 🌳",
    "우물 안 개구리다 🐸",
    "원수는 외나무 다리에서 만난다 🌉",
    "윗물이 맑아야 아랫물도 맑다 💧",
    "자라 보고 놀란 가슴 솥뚜껑 보고 놀란다 🐢",
    "작은 고추가 맵다 🌶️",
    "재주는 곰이 넘고 돈은 주인이 받는다 🐻",
    "제 눈에 안경이다 👓",
    "조개껍질을 모으는 사람이 진주를 얻는다 🐚",
    "좋은 약은 입에 쓰다 💊",
    "지렁이도 밟으면 꿈틀한다 🐛",
    "참새가 방앗간을 그대로 지나랴 🐦",
    "콩 심은 데 콩 나고 팥 심은 데 팥 난다 🌱",
    "티끌 모아 태산이 된다 ⛰️",
    "하늘의 별 따기다 ⭐",
    "한 번 엿듣고 백 번 말한다 👂",
    "호랑이도 제 말하면 온다 🐯",
    "홍길동이 아니면 모를 일이다 🦸‍♂️",
    "화살이 떨어져도 화살통은 챙긴다 🏹",
    "회초리 든 손이 부채 든 손보다 많다 👋",
    "흙이 묻어도 임자다 🌱",
    "힘은 쇠뿔도 꺾는다 💪",
    "가는 날이 장날이다 📅",
    "개구리 올챙이 적 생각 못한다 🐸",
    "고생 끝에 낙이 온다 🌈",
    "구르는 돌에는 이끼가 끼지 않는다 🪨",
    "금강산도 식후경이다 🏔️",
    "낮말은 새가 듣고 밤말은 쥐가 듣는다 🐦",
    "내 코가 석 자다 👃",
    "다 된 밥에 재 뿌리기다 🍚",
    "돌다리도 두들겨보고 건너라 🌉",
    "등잔 밑이 어둡다 💡",
    "마른 하늘에 날벼락이다 ⚡",
    "모로 가도 서울만 가면 된다 🏛️",
    "바늘 도둑이 소도둑 된다 🧵",
    "백지장도 맞들면 낫다 📄",
    "벼는 익을수록 고개를 숙인다 🌾",
    "사공이 많으면 배가 산으로 간다 🚣‍♂️",
    "소 잃고 외양간 고친다 🐄",
    "수박 겉 핥기다 🍉",
    "시작이 반이다 🚀",
    "아는 길도 물어가라 🗺️",
    "어깨 넘어로 본다 👀",
    "오르지 못할 나무는 쳐다보지도 말라 🌳",
    "우물 안 개구리다 🐸",
    "원수는 외나무 다리에서 만난다 🌉",
    "윗물이 맑아야 아랫물도 맑다 💧",
    "자라 보고 놀란 가슴 솥뚜껑 보고 놀란다 🐢",
    "작은 고추가 맵다 🌶️",
    "제 눈에 안경이다 👓",
    "좋은 약은 입에 쓰다 💊",
    "지렁이도 밟으면 꿈틀한다 🐛",
    "참새가 방앗간을 그대로 지나랴 🐦",
    "콩 심은 데 콩 나고 팥 심은 데 팥 난다 🌱",
    "티끌 모아 태산이 된다 ⛰️",
    "하늘의 별 따기다 ⭐",
    "한 번 엿듣고 백 번 말한다 👂",
    "호랑이도 제 말하면 온다 🐯",
    "화살이 떨어져도 화살통은 챙긴다 🏹",
    "회초리 든 손이 부채 든 손보다 많다 👋",
    "흙이 묻어도 임자다 🌱",
    "힘은 쇠뿔도 꺾는다 💪"
  ]

  onMount(() => {
    // 초기 상태 설정
    gsap.set('.letter', {
      opacity: 1,
      y: 0,
      scale: 1
    })

    // 초기 메시지 타이핑 애니메이션
    const initialText = document.querySelector('.message-text')
    if (initialText) {
      const initialMessage = `- ${messages[0]} -`
      
      // 텍스트를 span으로 감싸서 각 글자에 애니메이션 적용 (띄어쓰기와 이모티콘 보존)
      const chars = []
      
      // 이모티콘과 일반 텍스트를 분리하는 정규식
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]|[\u{1F9B0}-\u{1F9B3}]|[\u{200D}]|[\u{2640}]|[\u{2642}]|[\u{2695}]|[\u{2696}]|[\u{2708}]|[\u{2764}]|[\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}]/gu
      
      let lastIndex = 0
      let match
      
      while ((match = emojiRegex.exec(initialMessage)) !== null) {
        // 이모티콘 이전의 일반 텍스트 처리
        const beforeEmoji = initialMessage.slice(lastIndex, match.index)
        for (let i = 0; i < beforeEmoji.length; i++) {
          const char = beforeEmoji[i]
          if (char === ' ') {
            chars.push(`<span class="char" style="opacity: 1; display: inline-block;">&nbsp;</span>`)
          } else {
            chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`)
          }
        }
        
        // 이모티콘 처리
        chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${match[0]}</span>`)
        lastIndex = match.index + match[0].length
      }
      
      // 마지막 이모티콘 이후의 일반 텍스트 처리
      const afterEmoji = initialMessage.slice(lastIndex)
      for (let i = 0; i < afterEmoji.length; i++) {
        const char = afterEmoji[i]
        if (char === ' ') {
          chars.push(`<span class="char" style="opacity: 1; display: inline-block;">&nbsp;</span>`)
        } else {
          chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`)
        }
      }
      
      initialText.innerHTML = chars.join('')
      
      // 각 글자를 순차적으로 나타나게 함
      gsap.to('.char', {
        opacity: 1,
        duration: 0.05,
        stagger: 0.03,
        ease: 'none'
      })
    }

    // 무한 반복 애니메이션 - 작아졌다 커졌다 작아지는 사이클
    const tl = gsap.timeline({ repeat: -1 })
    
    // 글자들이 작아지면서 움직이는 애니메이션 (각각 다른 회전)
    tl.to('.letter-1', { y: -8, rotation: 12, scale: 0.8, duration: 2, ease: 'power1.inOut' })
      .to('.letter-2', { y: -8, rotation: -15, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-3', { y: -8, rotation: 8, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-4', { y: -8, rotation: -10, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-5', { y: -8, rotation: 18, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-6', { y: -8, rotation: -6, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
    
    .to('.letter-1', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' })
      .to('.letter-2', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-3', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-4', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-5', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-6', { y: 0, rotation: 0, scale: 1.2, duration: 2, ease: 'power1.inOut' }, '<')
    
    .to('.letter-1', { y: 8, rotation: -12, scale: 0.8, duration: 2, ease: 'power1.inOut' })
      .to('.letter-2', { y: 8, rotation: 15, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-3', { y: 8, rotation: -8, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-4', { y: 8, rotation: 10, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-5', { y: 8, rotation: -18, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-6', { y: 8, rotation: 6, scale: 0.8, duration: 2, ease: 'power1.inOut' }, '<')
    
    .to('.letter-1', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' })
      .to('.letter-2', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-3', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-4', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-5', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' }, '<')
      .to('.letter-6', { y: 0, rotation: 0, scale: 1, duration: 2, ease: 'power1.inOut' }, '<')

    // 점들 애니메이션 - 더 빠르게 변하는 사이클
    const dots = gsap.timeline({ repeat: -1 })
    dots.to('.dots span', {
      opacity: 0.3,
      scale: 0.6,
      y: 3,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power1.inOut'
    })
    .to('.dots span', {
      opacity: 1,
      scale: 1.5,
      y: -3,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power1.inOut'
    })
    .to('.dots span', {
      opacity: 0.3,
      scale: 0.6,
      y: 3,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power1.inOut'
    })
    .to('.dots span', {
      opacity: 0.3,
      scale: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power1.inOut'
    })

    // 메시지 변경 애니메이션
    const messageInterval = setInterval(() => {
      // 랜덤으로 메시지 선택 (이전 메시지와 다른 메시지 선택)
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * messages.length)
      } while (newIndex === currentMessageIndex && messages.length > 1)
      currentMessageIndex = newIndex
      
              // 메시지 타이핑 애니메이션
        const currentText = document.querySelector('.message-text')
        if (currentText) {
          const newMessage = `- ${messages[currentMessageIndex]} -`
          const messageLength = newMessage.length
          
          // 텍스트를 span으로 감싸서 각 글자에 애니메이션 적용 (띄어쓰기와 이모티콘 보존)
          const chars = []
          
          // 이모티콘과 일반 텍스트를 분리하는 정규식
          const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]|[\u{1F9B0}-\u{1F9B3}]|[\u{200D}]|[\u{2640}]|[\u{2642}]|[\u{2695}]|[\u{2696}]|[\u{2708}]|[\u{2764}]|[\u{FE0F}]|[\u{1F1E6}-\u{1F1FF}]/gu
          
          let lastIndex = 0
          let match
          
          while ((match = emojiRegex.exec(newMessage)) !== null) {
            // 이모티콘 이전의 일반 텍스트 처리
            const beforeEmoji = newMessage.slice(lastIndex, match.index)
            for (let i = 0; i < beforeEmoji.length; i++) {
              const char = beforeEmoji[i]
              if (char === ' ') {
                chars.push(`<span class="char" style="opacity: 1; display: inline-block;">&nbsp;</span>`)
              } else {
                chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`)
              }
            }
            
            // 이모티콘 처리
            chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${match[0]}</span>`)
            lastIndex = match.index + match[0].length
          }
          
          // 마지막 이모티콘 이후의 일반 텍스트 처리
          const afterEmoji = newMessage.slice(lastIndex)
          for (let i = 0; i < afterEmoji.length; i++) {
            const char = afterEmoji[i]
            if (char === ' ') {
              chars.push(`<span class="char" style="opacity: 1; display: inline-block;">&nbsp;</span>`)
            } else {
              chars.push(`<span class="char" style="opacity: 0; display: inline-block;">${char}</span>`)
            }
          }
          
          currentText.innerHTML = chars.join('')
          
          // 각 글자를 순차적으로 나타나게 함
          gsap.to('.char', {
            opacity: 1,
            duration: 0.05,
            stagger: 0.03,
            ease: 'none'
          })
        }
    }, 5000) // 5초 간격

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(messageInterval)
    }
  })
</script>

  <div class="waiting-animation" bind:this={container}>
    <div class="text-container">
      <span class="letter letter-1">기</span>
      <span class="letter letter-2">다</span>
      <span class="letter letter-3">려</span>
      <span class="letter letter-4">주</span>
      <span class="letter letter-5">세</span>
      <span class="letter letter-6">요</span>
    </div>
    <div class="dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
    <div class="message-container">
      <p class="message-text">- {messages[currentMessageIndex]} -</p>
    </div>
  </div>

<style>
  .waiting-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-family: 'Arial', sans-serif;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 2rem;
  }

  .text-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .letter {
    font-size: 4.5rem;
    font-weight: bold;
    margin: 0 15px;
    display: inline-block;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .letter-1 { color: #fbbf24; } /* 연한 노란색 */
  .letter-2 { color: #34d399; } /* 연한 초록색 */
  .letter-3 { color: #60a5fa; } /* 연한 파란색 */
  .letter-4 { color: #a78bfa; } /* 연한 보라색 */
  .letter-5 { color: #f87171; } /* 연한 빨간색 */
  .letter-6 { color: #fb7185; } /* 연한 분홍색 */

  .dots {
    display: flex;
    gap: 8px;
    margin-top: -1rem;
  }

  .dots span {
    font-size: 2rem;
    color: #60a5fa;
    opacity: 0.3;
    font-weight: bold;
  }

  .message-container {
    margin-top: 2rem;
    text-align: center;
  }

  .message-text {
    font-size: 1.5rem;
    color: #f3f4f6;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0;
  }

  @media (max-width: 768px) {
    .letter {
      font-size: 3rem;
      margin: 0 3px;
    }
    
    .dots span {
      font-size: 1.5rem;
    }

    .message-text {
      font-size: 1.2rem;
    }
  }
</style> 