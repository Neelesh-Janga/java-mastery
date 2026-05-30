import { useState, useCallback } from 'react'

const STORAGE_KEY = 'java-mastery-progress'

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveProgress(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)))
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(loadProgress)

  const markComplete = useCallback((exerciseId: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.add(exerciseId)
      saveProgress(next)
      return next
    })
  }, [])

  const markIncomplete = useCallback((exerciseId: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.delete(exerciseId)
      saveProgress(next)
      return next
    })
  }, [])

  const toggleComplete = useCallback((exerciseId: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(exerciseId)) {
        next.delete(exerciseId)
      } else {
        next.add(exerciseId)
      }
      saveProgress(next)
      return next
    })
  }, [])

  const isComplete = useCallback(
    (exerciseId: string) => completed.has(exerciseId),
    [completed]
  )

  const getTopicProgress = useCallback(
    (exerciseIds: string[]) => {
      const done = exerciseIds.filter(id => completed.has(id)).length
      return { done, total: exerciseIds.length }
    },
    [completed]
  )

  const resetProgress = useCallback(() => {
    const empty = new Set<string>()
    setCompleted(empty)
    saveProgress(empty)
  }, [])

  return { completed, markComplete, markIncomplete, toggleComplete, isComplete, getTopicProgress, resetProgress }
}
