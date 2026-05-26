import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../../lib/supabase'
import { setUser, setProfile, setLoading, signOut } from './authSlice'
import { fetchSessionHistory, clearHistory } from '../history/historySlice'

/**
 * AuthProvider — Bootstraps the Supabase auth session listener on app load.
 * Fetches user profile and session history when auth state changes.
 */
export default function AuthProvider({ children }) {
  const dispatch = useDispatch()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user))
        await fetchProfile(session.user.id)
      } else {
        dispatch(setLoading(false))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch(setUser(session.user))
          await fetchProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          dispatch(signOut())
          dispatch(clearHistory())
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    dispatch(setProfile(profile))
    dispatch(fetchSessionHistory(userId))
  }

  return children
}
