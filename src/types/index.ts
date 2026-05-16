export interface LinkedListNode {
  id: string
  value: number
  next: string | null
}

export interface LinkedListState {
  nodes: Record<string, LinkedListNode>
  head: string | null
}

export type StickFigureState =
  | 'idle'
  | 'walking'
  | 'drawing'
  | 'pointing'
  | 'celebrating'
  | 'thinking'

export type LearningMode = 'tutorial' | 'challenge'

export interface ChallengeTarget {
  values: number[]
  description: string
}
