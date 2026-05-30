import { useState, useCallback, useEffect } from 'react'
import { Exercise, ExecutionResult } from '../types'
import { CodeEditor } from './CodeEditor'
import { OutputPanel } from './OutputPanel'
import { SolutionDrawer } from './SolutionDrawer'
import { StudyCard } from './StudyCard'
import axios from 'axios'
import {
  Play, Lightbulb, BookOpen, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, RotateCcw
} from 'lucide-react'

interface Props {
  exercise: Exercise
  isComplete: boolean
  onToggleComplete: () => void
  onNext?: () => void
  onPrev?: () => void
}

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
}

export function ExercisePanel({ exercise, isComplete, onToggleComplete, onNext, onPrev }: Props) {
  const [code, setCode] = useState(exercise.starterCode)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [running, setRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [activeHint, setActiveHint] = useState(0)

  useEffect(() => {
    setCode(exercise.starterCode)
    setResult(null)
    setShowSolution(false)
    setShowHints(false)
    setActiveHint(0)
  }, [exercise.id, exercise.starterCode])

  const handleRun = useCallback(async () => {
    setRunning(true)
    setResult(null)
    try {
      const { data } = await axios.post<ExecutionResult>('/api/execute', { code })
      setResult(data)
    } catch {
      setResult({ output: '', error: 'Failed to connect to execution server.', success: false, executionTimeMs: 0 })
    } finally {
      setRunning(false)
    }
  }, [code])

  const handleReset = useCallback(() => {
    setCode(exercise.starterCode)
    setResult(null)
  }, [exercise.starterCode])

  // Concept = solution code is all comments (AWS/JPA scenario Q&A etc.)
  const isConceptExercise = exercise.solution.code
    .split('\n')
    .filter(l => l.trim().length > 0)
    .every(l => l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*'))

  // ── Concept exercise — full-screen study card layout ───────────────────
  if (isConceptExercise) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Minimal header — just badges + mark-done */}
        <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/30 px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className={DIFFICULTY_BADGE[exercise.difficulty]}>{exercise.difficulty}</span>
          </div>
          <button
            onClick={onToggleComplete}
            className={`btn-ghost flex-shrink-0 py-1 px-2.5 gap-1.5 ${isComplete ? 'text-emerald-400' : ''}`}
          >
            {isComplete ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            <span className="text-xs">{isComplete ? 'Done' : 'Mark done'}</span>
          </button>
        </div>

        {/* Study card — takes all remaining space */}
        <StudyCard exercise={exercise} />

        {/* Footer nav */}
        <div className="flex-shrink-0 border-t border-gray-800 px-4 sm:px-6 py-2.5 flex items-center justify-between bg-gray-900/30">
          <button onClick={onPrev} disabled={!onPrev}
            className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed py-2 px-3">
            <ChevronLeft size={15} /><span className="text-sm">Prev</span>
          </button>
          <button
            onClick={() => { if (!isComplete) onToggleComplete(); onNext?.() }}
            disabled={!onNext}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed py-2 px-4">
            <span className="text-sm">Next</span><ChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  // ── Code exercise — editor + output layout ─────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Description */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/30 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto" style={{ maxHeight: '35vh' }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className={DIFFICULTY_BADGE[exercise.difficulty]}>{exercise.difficulty}</span>
            <span className="text-xs text-gray-500 capitalize bg-gray-800/60 border border-gray-700/50 rounded px-2 py-0.5">
              {exercise.subtopic.replace(/-/g, ' ')}
            </span>
          </div>
          <button onClick={onToggleComplete}
            className={`btn-ghost flex-shrink-0 py-1 px-2 ${isComplete ? 'text-emerald-400' : ''}`}>
            {isComplete ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            <span className="text-xs hidden sm:inline">{isComplete ? 'Done' : 'Mark done'}</span>
          </button>
        </div>

        <h1 className="text-base sm:text-xl font-bold text-white leading-snug mb-1.5 sm:mb-2">
          {exercise.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{exercise.description}</p>

        {exercise.hints.length > 0 && (
          <div className="mt-2.5">
            <button onClick={() => setShowHints(h => !h)}
              className="text-xs flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors py-1">
              <Lightbulb size={12} />
              {showHints ? 'Hide hints' : `Hints (${exercise.hints.length})`}
            </button>
            {showHints && (
              <div className="mt-1.5 bg-amber-950/30 border border-amber-800/40 rounded-lg p-3">
                <p className="text-xs text-amber-200 leading-relaxed">💡 {exercise.hints[activeHint]}</p>
                {exercise.hints.length > 1 && (
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setActiveHint(h => Math.max(h - 1, 0))} disabled={activeHint === 0}
                      className="text-xs text-amber-400 disabled:text-amber-900">← prev</button>
                    <span className="text-xs text-amber-700">{activeHint + 1}/{exercise.hints.length}</span>
                    <button onClick={() => setActiveHint(h => Math.min(h + 1, exercise.hints.length - 1))} disabled={activeHint === exercise.hints.length - 1}
                      className="text-xs text-amber-400 disabled:text-amber-900">next →</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-900/50 border-b border-gray-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="ml-1.5 text-xs text-gray-500 font-mono hidden sm:inline">Main.java</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={handleReset} className="btn-ghost py-1 px-2 text-xs" title="Reset">
              <RotateCcw size={12} />
            </button>
            <button onClick={() => setShowSolution(true)} className="btn-secondary py-1.5 px-2.5 text-xs">
              <BookOpen size={12} />
              <span className="hidden sm:inline">Solution</span>
            </button>
            <button onClick={handleRun} disabled={running} className="btn-primary py-1.5 px-2.5 text-xs">
              {running
                ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                : <Play size={12} fill="currentColor" />}
              <span className="hidden sm:inline">{running ? 'Running…' : 'Run'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CodeEditor value={code} onChange={v => setCode(v ?? '')} onRun={handleRun} />
        </div>

        <OutputPanel result={result} running={running} />
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 border-t border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between bg-gray-900/30">
        <button onClick={onPrev} disabled={!onPrev}
          className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed py-2 px-3">
          <ChevronLeft size={15} /><span className="text-sm">Prev</span>
        </button>
        <button onClick={() => { if (!isComplete) onToggleComplete(); onNext?.() }} disabled={!onNext}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed py-2 px-4">
          <span className="text-sm">Next</span><ChevronRight size={15} />
        </button>
      </div>

      {showSolution && <SolutionDrawer solution={exercise.solution} onClose={() => setShowSolution(false)} />}
    </div>
  )
}
