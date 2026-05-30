import { Routes, Route, Navigate } from 'react-router-dom'
import { TopicsPage } from './components/TopicsPage'
import { ExercisePage } from './components/ExercisePage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<TopicsPage />} />
        <Route path="/topics/:topicId" element={<ExercisePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
