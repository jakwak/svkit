<script>
  import { enhance } from '$app/forms';

  let subject = '국어'
  let topic = ''
  let question = ''
  let correctAnswer = ''
  let wrongAnswer1 = ''
  let wrongAnswer2 = ''
  let wrongAnswer3 = ''
  let difficulty = '3' // 기본값: 보통 (3)

  function submitForm() {
    const quizData = {
      subject,
      topic,
      question,
      correctAnswer,
      wrongAnswers: [wrongAnswer1, wrongAnswer2, wrongAnswer3],
      difficulty: parseInt(difficulty),
    }

    console.log('제출된 데이터:', quizData)
  }
</script>

<form method="POST" use:enhance>
  <div
    class="max-w-2xl mx-auto p-6 rounded-lg shadow-md grid grid-cols-1 gap-2"
  >
    <h2 class="text-xl font-semibold mb-4 text-center">문제 입력</h2>
    <div class="flex gap-4 mb-2">
      <!-- 과목 -->
      <label class="form-control w-1/4">
        <span class="label-text text-xs">과목</span>
        <select name="subject" bind:value={subject} class="select w-full">
          <option value="국어">국어</option>
          <option value="수학">수학</option>
          <option value="사회">사회</option>
          <option value="과학">과학</option>
          <option value="영어">영어</option>
          <option value="상식">상식</option>
        </select>
      </label>

      <!-- 주제 -->
      <label class="form-control w-full">
        <span class="label-text text-xs">주제</span>
        <input
          name="topic"
          type="text"
          bind:value={topic}
          placeholder="주제 입력"
          class="input input-bordered w-full"
        />
      </label>

      <!-- 난이도 선택 -->
      <label class="form-control w-1/4">
        <span class="label-text text-xs">난이도</span>
        <select name="difficulty" bind:value={difficulty} class="select select-bordered w-full">
          <option value="1">1 - 쉬움</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5 - 어려움</option>
        </select>
      </label>
    </div>
    <!-- 문제 -->
    <label class="form-control w-full mb-2">
      <span class="label-text text-xs">문제</span>
      <input
        name="question"
        type="text"
        bind:value={question}
        placeholder="문제 입력"
        class="input input-bordered w-full"
      />
    </label>

    <!-- 정답 -->
    <label class="form-control w-full mb-2">
      <span class="label-text text-xs">정답</span>
      <input
        name="correctAnswer"
        type="text"
        bind:value={correctAnswer}
        placeholder="정답 입력"
        class="input input-bordered w-full"
      />
    </label>

    <!-- 오답 1 -->
    <label class="form-control w-full mb-2">
      <span class="label-text text-xs">오답 1</span>
      <input
        name="wrongAnswer1"
        type="text"
        bind:value={wrongAnswer1}
        placeholder="오답 1 입력"
        class="input input-bordered w-full"
      />
    </label>

    <!-- 오답 2 -->
    <label class="form-control w-full mb-2">
      <span class="label-text text-xs">오답 2</span>
      <input
        name="wrongAnswer2"
        type="text"
        bind:value={wrongAnswer2}
        placeholder="오답 2 입력"
        class="input input-bordered w-full"
      />
    </label>

    <!-- 오답 3 -->
    <label class="form-control w-full mb-2">
      <span class="label-text text-xs">오답 3</span>
      <input
        name="wrongAnswer3"
        type="text"
        bind:value={wrongAnswer3}
        placeholder="오답 3 입력"
        class="input input-bordered w-full"
      />
    </label>

    <!-- 제출 버튼 -->
    <button class="btn btn-primary w-full" type="submit">제출</button>
  </div>
</form>
