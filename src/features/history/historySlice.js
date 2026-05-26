import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchSessionHistory = createAsyncThunk(
  'history/fetch',
  async (userId, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(200)

    if (error) return rejectWithValue(error.message)
    return data
  }
)

export const saveSession = createAsyncThunk(
  'history/save',
  async (sessionData, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) return rejectWithValue(error.message)
    return data
  }
)

export const updateUserLevel = createAsyncThunk(
  'history/updateLevel',
  async ({ userId, newLevel }, { rejectWithValue }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ current_level: newLevel })
      .eq('id', userId)

    if (error) return rejectWithValue(error.message)
    return newLevel
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────

const historySlice = createSlice({
  name: 'history',
  initialState: {
    sessions: [],
    loading: false,
    saving: false,
    error: null,
    lastSavedSession: null,
  },
  reducers: {
    clearHistory(state) {
      state.sessions = []
      state.error = null
    },
    addLocalSession(state, action) {
      // For guest/offline mode — prepend to local list
      state.sessions.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSessionHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSessionHistory.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      .addCase(fetchSessionHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Save
      .addCase(saveSession.pending, (state) => {
        state.saving = true
      })
      .addCase(saveSession.fulfilled, (state, action) => {
        state.saving = false
        state.lastSavedSession = action.payload
        state.sessions.unshift(action.payload)
      })
      .addCase(saveSession.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
  },
})

// ─── Selectors ────────────────────────────────────────────────────────────────

/** Aggregate sessions to highest SM per calendar day for the graph */
export const selectGraphData = (state) => {
  const { sessions } = state.history
  if (!sessions.length) return []

  const dayMap = {}

  for (const s of sessions) {
    const day = new Date(s.played_at).toLocaleDateString('en-CA') // YYYY-MM-DD
    if (!dayMap[day] || s.sm_score > dayMap[day].sm_score) {
      dayMap[day] = {
        date: day,
        smScore: parseFloat(s.sm_score.toFixed(3)),
        avgTime: parseFloat(s.avg_time_seconds.toFixed(2)),
        level: s.level,
      }
    }
  }

  return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date))
}

/** True if the provided smScore is a new daily high for today */
export const selectIsDailyHigh = (state, smScore) => {
  const today = new Date().toLocaleDateString('en-CA')
  const todaySessions = state.history.sessions.filter(
    s => new Date(s.played_at).toLocaleDateString('en-CA') === today
  )
  // Exclude any just-saved session with identical score (would be duplicated)
  const previousBest = todaySessions
    .slice(1) // skip the most recently saved
    .reduce((best, s) => Math.max(best, s.sm_score), 0)

  return smScore > previousBest
}

export const { clearHistory, addLocalSession } = historySlice.actions
export default historySlice.reducer
