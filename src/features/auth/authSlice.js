import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,       // Supabase user object
    profile: null,    // { current_level, username }
    loading: true,    // true while checking session
    showAuthModal: false,
    authMode: 'login', // 'login' | 'signup'
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.loading = false
    },
    setProfile(state, action) {
      state.profile = action.payload
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
    openAuthModal(state, action) {
      state.showAuthModal = true
      state.authMode = action.payload || 'login'
    },
    closeAuthModal(state) {
      state.showAuthModal = false
    },
    setAuthMode(state, action) {
      state.authMode = action.payload
    },
    signOut(state) {
      state.user = null
      state.profile = null
    },
  },
})

export const {
  setUser, setProfile, setLoading,
  openAuthModal, closeAuthModal, setAuthMode, signOut,
} = authSlice.actions

export default authSlice.reducer
