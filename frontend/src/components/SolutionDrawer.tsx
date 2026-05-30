import { useEffect } from 'react'
import { Solution } from '../types'
import { CodeBlock } from './CodeBlock'
import { X, BookOpen, Code2, Hash } from 'lucide-react'

interface Props {
  solution: Solution
  onClose: () => void
}

export function SolutionDrawer({ solution, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Full-screen on mobile, wide drawer on desktop */}
      <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-2xl bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
          <div className="flex items-center gap-2 text-orange-400">
            <BookOpen size={16} />
            <h2 className="font-semibold text-white text-sm sm:text-base">Solution & Explanation</h2>
          </div>
          <button onClick={onClose} className="btn-ghost py-1.5 px-2">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Solution code */}
          <div className="px-4 sm:px-6 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Code2 size={13} className="text-orange-400" />
              <h3 className="text-xs sm:text-sm font-semibold text-white">Solution</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-700">
              <CodeBlock code={solution.code} />
            </div>
          </div>

          {/* Explanation */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <BookOpen size={13} className="text-blue-400" />
              <h3 className="text-xs sm:text-sm font-semibold text-white">Explanation</h3>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {solution.explanation}
              </p>
            </div>
          </div>

          {/* Method signatures / exam tips */}
          {solution.methodSignatures && solution.methodSignatures.length > 0 && (
            <div className="px-4 sm:px-6 pb-6">
              <div className="flex items-center gap-2 mb-2.5">
                <Hash size={13} className="text-purple-400" />
                <h3 className="text-xs sm:text-sm font-semibold text-white">
                  {solution.methodSignatures[0]?.method?.startsWith('Tip:')
                    ? 'Exam Tips'
                    : 'Method Signatures'}
                </h3>
              </div>
              <div className="space-y-2.5">
                {solution.methodSignatures.map((sig, i) => (
                  <div key={i} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 sm:p-4">
                    <code className="block text-xs font-mono text-orange-300 bg-gray-900/60 rounded-lg px-2.5 py-2 mb-2 leading-relaxed whitespace-pre-wrap break-all">
                      {sig.method}
                    </code>
                    <p className="text-xs text-gray-400 leading-relaxed">{sig.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-800 px-4 sm:px-6 py-3">
          <button onClick={onClose} className="btn-secondary w-full justify-center py-2.5 text-sm">
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
        @media (max-width: 640px) {
          @keyframes slide-in {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </>
  )
}
