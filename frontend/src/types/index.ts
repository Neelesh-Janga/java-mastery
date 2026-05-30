export interface MethodSignature {
  method: string
  description: string
}

export interface Solution {
  code: string
  explanation: string
  methodSignatures: MethodSignature[]
}

export interface Exercise {
  id: string
  topic: string
  subtopic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  title: string
  description: string
  starterCode: string
  hints: string[]
  solution: Solution
}

export interface Topic {
  id: string
  title: string
  description: string
  icon: string
  exerciseCount: number
}

export interface ExecutionResult {
  output: string
  error: string
  success: boolean
  executionTimeMs: number
}

export interface LectureSection {
  title: string
  content: string
  codeExample?: string
}

export interface Lecture {
  id: string
  topicId: string
  title: string
  order: number
  sections: LectureSection[]
}
