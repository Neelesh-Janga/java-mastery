import { useState } from 'react'
import { Exercise } from '../types'
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, CheckCircle2, AlertTriangle, Star } from 'lucide-react'

interface Props {
  exercise: Exercise
}

/** Strip leading // or * from comment lines, collapse blank lines */
function stripComments(raw: string): string {
  return raw
    .split('\n')
    .map(l => l.replace(/^\s*(\/\/\s?|\*\s?|\*\/|\/\*+)/, '').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Parse the solution.methodSignatures — each has "Tip: <title>" + description */
function parseTips(sigs: Array<{ method: string; description: string }>) {
  return sigs.map(s => ({
    title: s.method.replace(/^Tip:\s*/i, '').replace(/^Exam Tip:\s*/i, ''),
    body:  s.description,
  }))
}

export function StudyCard({ exercise }: Props) {
  const [revealed, setRevealed] = useState(false)

  const tips = parseTips(exercise.solution.methodSignatures ?? [])

  // Parse the solution.code for any structured content after // ANSWER:
  const answerLines = stripComments(exercise.solution.code)
  // Remove leading "ANSWER:" header line if present
  const answerBody = answerLines.replace(/^ANSWER:\s*/i, '').trim()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Scenario card ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-700/60 bg-gray-900/50 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-700/50 bg-gray-800/40">
            <span className="text-lg">☁️</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Scenario
            </span>
            <span className="ml-auto text-xs text-gray-600 capitalize">
              {exercise.subtopic.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Question */}
          <div className="px-5 py-5">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-3">
              {exercise.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {exercise.description}
            </p>
          </div>
        </div>

        {/* ── Key hints ────────────────────────────────────────────── */}
        {exercise.hints.length > 0 && (
          <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-800/30">
              <Lightbulb size={13} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Think about this
              </span>
            </div>
            <ul className="px-5 py-4 space-y-2.5">
              {exercise.hints.map((hint, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-amber-200/80">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-900/50 border border-amber-700/50 flex items-center justify-center text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Reveal answer toggle ─────────────────────────────────── */}
        <button
          onClick={() => setRevealed(r => !r)}
          className={`w-full rounded-2xl border px-5 py-4 flex items-center justify-between transition-all duration-200 ${
            revealed
              ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-300'
              : 'border-orange-700/50 bg-orange-950/20 text-orange-300 hover:bg-orange-950/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={16} />
            <span className="font-semibold text-sm">
              {revealed ? 'Hide Answer' : 'Reveal Answer'}
            </span>
          </div>
          {revealed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* ── Answer section ───────────────────────────────────────── */}
        {revealed && (
          <div className="space-y-4 animate-fade-in">

            {/* Main explanation */}
            <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-emerald-800/30">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Explanation
                </span>
              </div>
              <div className="px-5 py-4">
                {/* Structured answer from solution.code (key points, HOW TO, etc.) */}
                {answerBody && (
                  <div className="mb-4">
                    {answerBody.split('\n\n').map((block, i) => {
                      // Detect section headers (ALL CAPS followed by colon)
                      const headerMatch = block.match(/^([A-Z][A-Z\s/:]+):\n([\s\S]*)/)
                      if (headerMatch) {
                        return (
                          <div key={i} className="mb-3">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1.5">
                              {headerMatch[1]}
                            </p>
                            <div className="space-y-1">
                              {headerMatch[2].split('\n').filter(Boolean).map((line, j) => (
                                <p key={j} className="text-sm text-gray-300 leading-relaxed pl-2">
                                  {line.startsWith('- ') ? (
                                    <span className="flex gap-2">
                                      <span className="text-emerald-500 flex-shrink-0">•</span>
                                      <span>{line.slice(2)}</span>
                                    </span>
                                  ) : line}
                                </p>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return (
                        <p key={i} className="text-sm text-gray-300 leading-relaxed mb-2">
                          {block}
                        </p>
                      )
                    })}
                  </div>
                )}

                {/* Long-form explanation */}
                <div className="border-t border-emerald-900/50 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Deep Dive
                  </p>
                  {exercise.solution.explanation.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-gray-300 leading-relaxed mb-3">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Exam tips */}
            {tips.length > 0 && (
              <div className="rounded-2xl border border-purple-800/40 bg-purple-950/20 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-purple-800/30">
                  <Star size={13} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Exam Tips
                  </span>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertTriangle size={14} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-200 mb-1">{tip.title}</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{tip.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}
