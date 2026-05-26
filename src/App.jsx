import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Dashboard from './screens/Dashboard'
import TrainingSession from './screens/TrainingSession'
import PostSession from './screens/PostSession'
import AuthModal from './components/AuthModal'

export default function App() {
  const { status } = useSelector(s => s.session)

  return (
    <>
      <AuthModal />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/train"
          element={
            status === 'idle'
              ? <Navigate to="/" replace />
              : <TrainingSession />
          }
        />
        <Route
          path="/summary"
          element={
            status !== 'complete'
              ? <Navigate to="/" replace />
              : <PostSession />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
