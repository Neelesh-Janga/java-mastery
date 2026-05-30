import { Exercise } from '../types'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

interface Props {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (ex: Exercise) => void
  isComplete: (id: string) => boolean
}

const DIFFICULTY_DOT: Record<string, string> = {
  beginner: 'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced: 'bg-red-500',
}

export function TopicSidebar({ exercises, selectedId, onSelect, isComplete }: Props) {
  const groups = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const key = ex.subtopic
    if (!acc[key]) acc[key] = []
    acc[key].push(ex)
    return acc
  }, {})

  return (
    <aside className="w-72 h-full border-r border-gray-800 bg-gray-900/60 overflow-y-auto flex-shrink-0">
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          {exercises.length} Exercises
        </p>

        {Object.entries(groups).map(([subtopic, exs]) => (
          <div key={subtopic} className="mb-5">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold px-2 mb-1.5 capitalize">
              {subtopic.replace(/-/g, ' ')}
            </p>
            <div className="space-y-0.5">
              {exs.map(ex => {
                const done = isComplete(ex.id)
                const selected = ex.id === selectedId
                return (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-left transition-all duration-100 group active:scale-[0.98] ${
                      selected
                        ? 'bg-orange-900/30 border border-orange-700/40 text-orange-200'
                        : 'hover:bg-gray-800/60 text-gray-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 size={15} className="text-emerald-400" />
                      ) : (
                        <Circle size={15} className={selected ? 'text-orange-400' : 'text-gray-600'} />
                      )}
                    </span>
                    <span className="flex-1 text-xs leading-snug">{ex.title}</span>
                    <span className="flex-shrink-0 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_DOT[ex.difficulty] ?? 'bg-gray-600'}`} />
                      {selected && <ChevronRight size={11} className="text-orange-400" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
