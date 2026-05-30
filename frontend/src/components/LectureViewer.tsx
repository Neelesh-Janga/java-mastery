import { useState } from 'react'
import { Lecture } from '../types'
import { CodeBlock } from './CodeBlock'
import { ChevronLeft, ChevronRight, BookOpen, Code2, X } from 'lucide-react'

interface Props {
  lectures: Lecture[]
  onClose: () => void
}

export function LectureViewer({ lectures, onClose }: Props) {
  const [lectureIdx, setLectureIdx] = useState(0)
  const [sectionIdx, setSectionIdx] = useState(0)

  const lecture = lectures[lectureIdx]
  const section = lecture?.sections[sectionIdx]

  const totalSections = lectures.reduce((s, l) => s + l.sections.length, 0)
  const doneSections = lectures.slice(0, lectureIdx).reduce((s, l) => s + l.sections.length, 0) + sectionIdx + 1

  const goNext = () => {
    if (sectionIdx < lecture.sections.length - 1) {
      setSectionIdx(s => s + 1)
    } else if (lectureIdx < lectures.length - 1) {
      setLectureIdx(l => l + 1)
      setSectionIdx(0)
    }
  }

  const goPrev = () => {
    if (sectionIdx > 0) {
      setSectionIdx(s => s - 1)
    } else if (lectureIdx > 0) {
      setLectureIdx(l => l - 1)
      setSectionIdx(lectures[lectureIdx - 1].sections.length - 1)
    }
  }

  const isFirst = lectureIdx === 0 && sectionIdx === 0
  const isLast = lectureIdx === lectures.length - 1 && sectionIdx === lecture.sections.length - 1

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={15} className="text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-white text-sm truncate">{lecture.title}</span>
          <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 flex-shrink-0">
            {doneSections}/{totalSections}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Lecture pills — hidden on small screens */}
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            {lectures.map((l, i) => (
              <button key={l.id} onClick={() => { setLectureIdx(i); setSectionIdx(0) }}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  i === lectureIdx ? 'bg-blue-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="btn-ghost py-1.5 px-2 flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-0.5 bg-gray-800">
        <div className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(doneSections / totalSections) * 100}%` }} />
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
            {lecture.title} — {sectionIdx + 1}/{lecture.sections.length}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 leading-snug">
            {section.title}
          </h2>

          <div className="mb-5">
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-300 leading-relaxed mb-3 text-sm sm:text-base">
                {para}
              </p>
            ))}
          </div>

          {section.codeExample && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={12} className="text-orange-400" />
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Code Example</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-700">
                <CodeBlock code={section.codeExample} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={goPrev} disabled={isFirst}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed py-2 px-4">
          <ChevronLeft size={15} /> <span className="text-sm">Prev</span>
        </button>

        {/* Section dots */}
        <div className="flex items-center gap-1.5">
          {lecture.sections.map((_, i) => (
            <button key={i} onClick={() => setSectionIdx(i)}
              className={`rounded-full transition-all ${
                i === sectionIdx ? 'w-4 h-1.5 bg-blue-400' : 'w-1.5 h-1.5 bg-gray-700 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <button onClick={onClose} className="btn-success py-2 px-4 text-sm">
            Done ✓
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary py-2 px-4">
            <span className="text-sm">Next</span> <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
