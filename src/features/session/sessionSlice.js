import { createSlice } from '@reduxjs/toolkit'
import { generateQuestion } from '../session/questionGenerator'

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    status: 'idle',         // 'idle' | 'active' | 'paused' | 'complete'
    level: 1,
    totalQuestions: 10,
    currentQuestionIndex: 0,
    currentQuestion: null,  // { premises, question, correctAnswer }
    answers: [],            // [{ correct: bool, timeMs: number }]
    questionStartTime: null,
    pauseStartTime: null,
    feedbackState: null,    // 'correct' | 'incorrect' | null
  },
  reducers: {
    startSession(state, action) {
      const { totalQuestions, level } = action.payload
      state.status = 'active'
      state.level = level
      state.totalQuestions = totalQuestions
      state.currentQuestionIndex = 0
      state.answers = []
      state.feedbackState = null
      state.currentQuestion = generateQuestion(level)
      state.questionStartTime = Date.now()
      state.pauseStartTime = null
    },

    submitAnswer(state, action) {
      const { userAnswer } = action.payload
      const timeMs = Date.now() - state.questionStartTime
      const correct = userAnswer === state.currentQuestion.correctAnswer

      state.feedbackState = correct ? 'correct' : 'incorrect'
      state.answers.push({ correct, timeMs })
    },

    advanceQuestion(state) {
      state.feedbackState = null
      const nextIndex = state.currentQuestionIndex + 1

      if (nextIndex >= state.totalQuestions) {
        state.status = 'complete'
        state.currentQuestion = null
      } else {
        state.currentQuestionIndex = nextIndex
        state.currentQuestion = generateQuestion(state.level)
        state.questionStartTime = Date.now()
      }
    },

    pauseSession(state) {
      if (state.status === 'active') {
        state.status = 'paused'
        state.pauseStartTime = Date.now()
      }
    },

    resumeSession(state) {
      if (state.status === 'paused') {
        state.status = 'active'
        state.pauseStartTime = null
        // Discard current question, generate a fresh one at same level
        state.currentQuestion = generateQuestion(state.level)
        state.questionStartTime = Date.now()
        state.feedbackState = null
      }
    },

    resetSession(state) {
      state.status = 'idle'
      state.currentQuestion = null
      state.answers = []
      state.feedbackState = null
      state.questionStartTime = null
      state.pauseStartTime = null
    },

    updateLevel(state, action) {
      state.level = action.payload
    },
  },
})

export const {
  startSession, submitAnswer, advanceQuestion,
  pauseSession, resumeSession, resetSession, updateLevel,
} = sessionSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSessionStats = (state) => {
  const { answers, level } = state.session
  if (!answers.length) return null

  const correct = answers.filter(a => a.correct).length
  const accuracy = correct / answers.length
  const avgTimeMs = answers.reduce((s, a) => s + a.timeMs, 0) / answers.length
  const avgTimeSec = avgTimeMs / 1000
  const smScore = (1 / avgTimeSec) * level

  // Leveling logic
  let levelChange = 0
  if (accuracy >= 0.8 && avgTimeSec <= 4.5) levelChange = 1
  else if (accuracy < 0.6) levelChange = -1

  return {
    accuracy,
    avgTimeSec,
    smScore,
    levelChange,
    correct,
    total: answers.length,
  }
}

export default sessionSlice.reducer
