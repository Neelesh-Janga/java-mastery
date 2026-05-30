import { ExecutionResult } from '../types'
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react'

interface Props {
  result: ExecutionResult | null
  running: boolean
}

export function OutputPanel({ result, running }: Props) {
  if (running) {
    return (
      <div className="flex-shrink-0 h-32 border-t border-gray-800 bg-gray-900/50 flex items-center justify-center gap-3 text-gray-400 text-sm">
        <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        Executing code...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex-shrink-0 h-10 border-t border-gray-800 bg-gray-900/50 flex items-center px-4 gap-2 text-gray-700 text-xs">
        <Terminal size={12} />
        Output
      </div>
    )
  }

  return (
    <div className={`flex-shrink-0 border-t ${result.success ? 'border-gray-800' : 'border-red-900/50'} bg-gray-900/50`}>
      {/* Status bar */}
      <div className={`flex items-center gap-2 px-4 py-2 border-b ${result.success ? 'border-gray-800' : 'border-red-900/30'}`}>
        {result.success ? (
          <>
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Execution successful</span>
          </>
        ) : (
          <>
            <XCircle size={13} className="text-red-400" />
            <span className="text-xs font-medium text-red-400">Execution failed</span>
          </>
        )}
        {result.executionTimeMs > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
            <Clock size={11} />
            {result.executionTimeMs}ms
          </span>
        )}
      </div>

      {/* Output content */}
      <div className="max-h-48 overflow-y-auto px-4 py-3">
        {result.output && (
          <pre className="text-xs font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
            {result.output}
          </pre>
        )}
        {result.error && (
          <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap leading-relaxed mt-1">
            {result.error}
          </pre>
        )}
        {!result.output && !result.error && (
          <p className="text-xs text-gray-500 italic">No output</p>
        )}
      </div>
    </div>
  )
}
