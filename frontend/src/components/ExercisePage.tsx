import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Exercise, Lecture, Topic } from '../types'
import { useProgress } from '../hooks/useProgress'
import { TopicSidebar } from './TopicSidebar'
import { ExercisePanel } from './ExercisePanel'
import { LectureViewer } from './LectureViewer'
import axios from 'axios'
import { ArrowLeft, BookOpen, GraduationCap, Menu, X } from 'lucide-react'

export function ExercisePage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showLectures, setShowLectures] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { isComplete, toggleComplete, getTopicProgress } = useProgress()

  useEffect(() => {
    if (!topicId) return
    async function load() {
      try {
        const [{ data: topics }, { data: exs }, { data: lecs }] = await Promise.all([
          axios.get<Topic[]>('/api/topics'),
          axios.get<Exercise[]>(`/api/topics/${topicId}/exercises`),
          axios.get<Lecture[]>(`/api/topics/${topicId}/lectures`).catch(() => ({ data: [] }))
        ])
        const found = topics.find(t => t.id === topicId)
        setTopic(found || null)
        setExercises(exs)
        setLectures(lecs)
        if (exs.length > 0) setSelectedExercise(exs[0])
        if (lecs.length > 0 && exs.length > 0) {
          const seen = localStorage.getItem(`lectures-seen-${topicId}`)
          if (!seen) setShowLectures(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [topicId])

  const handleSelectExercise = useCallback((ex: Exercise) => {
    setSelectedExercise(ex)
    setSidebarOpen(false) // close drawer on mobile after selecting
  }, [])

  const handleNext = useCallback(() => {
    if (!selectedExercise) return
    const idx = exercises.findIndex(e => e.id === selectedExercise.id)
    if (idx < exercises.length - 1) setSelectedExercise(exercises[idx + 1])
  }, [selectedExercise, exercises])

  const handlePrev = useCallback(() => {
    if (!selectedExercise) return
    const idx = exercises.findIndex(e => e.id === selectedExercise.id)
    if (idx > 0) setSelectedExercise(exercises[idx - 1])
  }, [selectedExercise, exercises])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const ids = exercises.map(e => e.id)
  const { done, total } = getTopicProgress(ids)
  const currentIndex = selectedExercise
    ? exercises.findIndex(e => e.id === selectedExercise.id)
    : 0

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 bg-gray-900/70 backdrop-blur-sm z-20">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="btn-ghost p-2 lg:hidden"
              aria-label="Toggle exercise list"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button onClick={() => navigate('/')} className="btn-ghost py-1 px-2">
              <ArrowLeft size={15} />
              <span className="hidden sm:inline text-sm">Topics</span>
            </button>
            <div className="h-4 w-px bg-gray-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-base">{topic?.icon}</span>
              <span className="font-semibold text-white text-sm truncate max-w-[140px] sm:max-w-none">
                {topic?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lectures.length > 0 && (
              <button
                onClick={() => { setShowLectures(true); localStorage.setItem(`lectures-seen-${topicId}`, '1') }}
                className="btn-ghost py-1 px-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-800/50 hover:border-blue-700"
              >
                <GraduationCap size={13} />
                <span className="hidden sm:inline">Theory ({lectures.length})</span>
                <span className="sm:hidden">{lectures.length}</span>
              </button>
            )}
            <span className="text-xs text-gray-500">{done}/{total}</span>
            <div className="w-16 sm:w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all"
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={12} className="text-gray-600 hidden sm:block" />
              <span className="text-xs text-gray-500">{currentIndex + 1}/{total}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Lecture viewer */}
      {showLectures && lectures.length > 0 && (
        <LectureViewer
          lectures={lectures}
          onClose={() => { setShowLectures(false); localStorage.setItem(`lectures-seen-${topicId}`, '1') }}
        />
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed drawer on mobile, static on desktop */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-[var(--header-h,0)] lg:top-auto
          flex-shrink-0
        `}>
          <TopicSidebar
            exercises={exercises}
            selectedId={selectedExercise?.id ?? null}
            onSelect={handleSelectExercise}
            isComplete={isComplete}
          />
        </div>

        {/* Main content */}
        {selectedExercise ? (
          <ExercisePanel
            exercise={selectedExercise}
            isComplete={isComplete(selectedExercise.id)}
            onToggleComplete={() => toggleComplete(selectedExercise.id)}
            onNext={currentIndex < exercises.length - 1 ? handleNext : undefined}
            onPrev={currentIndex > 0 ? handlePrev : undefined}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select an exercise to begin
          </div>
        )}
      </div>
    </div>
  )
}
