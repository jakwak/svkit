<script lang="ts">
  import { marked } from 'marked'

  let {content, block_cls="border-1 bg-zinc-850 p-2 text-gray-300 my-3 mr-5"} = $props()

  // 🚀 Custom Renderer 생성
  const renderer = new marked.Renderer()

  // ✅ BlockQuote 스타일 변경 (외곽선 추가)
  renderer.blockquote = (quote) => {
    const boldRegex = /\*\*([^*]+)\*\*/g
    const boldText = quote.text.replace(boldRegex, (_, text) => `&nbsp;<u><b>${text}</b></u>&nbsp;`)
    const underlineRegex = /\=\=([^*]+)\=\=/g
    const underlineText = boldText.replace(underlineRegex, (_, text) => `&nbsp;<u><b>${text}</b></u>&nbsp;`)

    const text = underlineText.replace(/\n/g, '<br>')

    return `<blockquote class="${block_cls}">${text}</blockquote>`
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

  // ✅ <b> 태그로 강조 처리 (**텍스트**)
  const boldExtension = {
    name: 'bold',
    level: 'inline', // 인라인 요소로 처리
    start(src: string) {
      return src.match(/\*\*([^*]+)\*\*/)?.index
    },
    tokenizer(src: string, tokens: any) {
      const match = /^\*\*([^*]+)\*\*/.exec(src)
      if (match) {
        return {
          type: 'bold',
          raw: match[0],
          text: match[1],
        }
      }
    },
    renderer(token: any) {
      return `<b>${token.text}</b>`
    },
  }

  // 🚀 marked에 확장 기능 등록
  marked.use({ extensions: [underlineExtension, boldExtension] })
</script>

<div class="w-full">{@html marked(content.replace(/^[①-⑳]\s*/, ''))}</div>
