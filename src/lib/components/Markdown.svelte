<script lang="ts">
  import { marked } from 'marked'

  export let content = ''

  // 🚀 Custom Renderer 생성
  const renderer = new marked.Renderer()

  // ✅ BlockQuote 스타일 변경 (외곽선 추가)
  renderer.blockquote = (quote) => {
    // console.log('Blockquote 내용:', quote) // 🚀 디버깅
    // ✅ Bold 텍스트를 Underline로 변경
    const boldRegex = /\*\*([^*]+)\*\*/g
    const underlineText = quote.text.replace(boldRegex, (_, text) => `<u><b>${text}</b></u>`)
    const text = underlineText.replace(/\n/g, '<br>')
    return `<blockquote class="border-1 bg-zinc-850 p-2 text-gray-300 my-3 mr-5">${text}</blockquote>`
  }

  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown 사용
    breaks: true, // 🚀 줄바꿈 자동 변환
    renderer,
  })

  // // 🚀 marked에 커스텀 렌더러 적용
  // marked.use({ renderer })

  // ✅ <u> 태그로 밑줄 처리 (==텍스트==)
  const underlineExtension = {
    name: 'underline',
    level: 'inline', // 인라인 요소로 처리
    start(src: string) {
      return src.match(/==/)?.index
    },
    tokenizer(src: string, tokens: any) {
      const match = /^==(.*?)==/.exec(src)
      if (match) {
        return {
          type: 'underline',
          raw: match[0],
          text: match[1],
        }
      }
    },
    renderer(token: any) {
      return `<u>${token.text}</u>`
    },
  }

  // 🚀 marked에 확장 기능 등록
  marked.use({ extensions: [underlineExtension] })

  let markdownText = `
  # Custom Markdown  
  - **Bold**  
  - *Italic*  
  - [Link](https://svelte.dev)  
  - \`Inline Code\`  
  - ==밑줄 추가==`

  let markdownText2 = `
  # Markdown 예제  

  **일반 텍스트**  

  > 이것은 인용문입니다.  
  > 이것은 인용문입니다.
  > fsfsfsfdfcfdfdfsdfsdfsdfsdfsdfsfsd
  `
</script>

<div>{@html marked(content)}</div>
