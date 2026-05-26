import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import sessionReducer from '../features/session/sessionSlice'
import historyReducer from '../features/history/historySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Allow Date.now() values in state
        ignoredPaths: ['session.questionStartTime', 'session.pauseStartTime'],
      },
    }),
})
