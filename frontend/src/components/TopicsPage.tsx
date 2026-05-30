import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topic } from '../types'
import { useProgress } from '../hooks/useProgress'
import axios from 'axios'
import { BookOpen, ChevronRight, Trophy, RotateCcw, Linkedin } from 'lucide-react'

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [exerciseIds, setExerciseIds] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const navigate = useNavigate()
  const { getTopicProgress, resetProgress } = useProgress()

  // Tick elapsed seconds while loading (shows user something is happening)
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [loading])

  useEffect(() => {
    setLoading(true)
    setError(false)
    setElapsed(0)

    async function load() {
      try {
        const { data: topicList } = await axios.get<Topic[]>('/api/topics', { timeout: 90_000 })
        setTopics(topicList)

        const ids: Record<string, string[]> = {}
        await Promise.all(
          topicList.map(async t => {
            const { data: exs } = await axios.get(`/api/topics/${t.id}/exercises`, { timeout: 30_000 })
            ids[t.id] = exs.map((e: { id: string }) => e.id)
          })
        )
        setExerciseIds(ids)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [retryCount])

  const totalExercises = topics.reduce((s, t) => s + t.exerciseCount, 0)
  const totalDone = Object.entries(exerciseIds).reduce((s, [tid]) => {
    const { done } = getTopicProgress(exerciseIds[tid] || [])
    return s + done
  }, 0)

  if (loading) {
    const warming = elapsed > 5
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center px-6 max-w-sm">
          <div className="w-14 h-14 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          {warming ? (
            <>
              <p className="text-white font-semibold mb-2">Backend is warming up…</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-1">
                The server spins down after inactivity and takes ~60 seconds to wake up.
              </p>
              <p className="text-gray-600 text-xs">{elapsed}s elapsed — hang tight ☕</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Loading topics…</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center px-6 max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white font-semibold mb-2">Couldn't reach the server</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            The backend may still be starting up. Wait a moment and try again.
          </p>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="btn-primary py-2.5 px-6 text-sm"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg text-white">Java Mastery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
              <Trophy size={13} className="text-amber-400 flex-shrink-0" />
              <span>{totalDone}/{totalExercises}</span>
              <span className="hidden sm:inline">completed</span>
            </div>
            <button
              onClick={() => { if (confirm('Reset all progress?')) resetProgress() }}
              className="btn-ghost text-xs p-2"
              title="Reset progress"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-14">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Master Java One Topic at a Time
          </h1>
          <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Interactive exercises from beginner to advanced — with code execution, hints, and full solutions with method signatures.
          </p>
          {totalExercises > 0 && (
            <div className="mt-5 inline-flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-full px-4 sm:px-6 py-2">
              <div className="h-2 w-32 sm:w-48 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalExercises > 0 ? (totalDone / totalExercises) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                {Math.round((totalDone / totalExercises) * 100)}% complete
              </span>
            </div>
          )}
        </div>

        {/* Topic cards — 1 col on mobile, 2 on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {topics.map(topic => {
            const ids = exerciseIds[topic.id] || []
            const { done, total } = getTopicProgress(ids)
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const mastered = done === total && total > 0

            return (
              <button
                key={topic.id}
                onClick={() => navigate(`/topics/${topic.id}`)}
                className="card p-4 sm:p-6 text-left hover:border-orange-700/60 hover:bg-gray-800/50 transition-all duration-200 group active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{topic.icon}</span>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-semibold text-white group-hover:text-orange-300 transition-colors leading-snug">
                        {topic.title}
                      </h2>
                      <p className="text-xs text-gray-500">{total} exercises</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {mastered && (
                      <span className="text-xs font-medium text-amber-400 bg-amber-900/30 border border-amber-700/40 rounded-full px-2 py-0.5 hidden sm:inline">
                        Mastered
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {topic.description}
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{done} / {total} completed</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mastered
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-orange-700 to-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-base">☕</span>
            <span>Built with passion for Java learners</span>
          </div>
          <a
            href="https://www.linkedin.com/in/neelesh-janga/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors group"
          >
            <Linkedin size={15} className="text-blue-500 group-hover:text-blue-400 transition-colors" />
            <span>Neelesh Janga</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
