import { create } from 'zustand'
import { LinkedListNode } from '../types'

const generateId = () => Math.random().toString(36).slice(2, 11)

interface LinkedListStore {
  nodes: Record<string, LinkedListNode>
  head: string | null
  insertAtHead: (value: number) => void
  insertAtTail: (value: number) => void
  deleteNode: (value: number) => void
  deleteById: (id: string) => void
  reset: () => void
  getOrderedNodes: () => LinkedListNode[]
}

const useLinkedListStore = create<LinkedListStore>((set, get) => ({
  nodes: {},
  head: null,

  insertAtHead: (value) => {
    const id = generateId()
    const node: LinkedListNode = { id, value, next: get().head }
    set((s) => ({ nodes: { ...s.nodes, [id]: node }, head: id }))
  },

  insertAtTail: (value) => {
    const id = generateId()
    const node: LinkedListNode = { id, value, next: null }
    set((s) => {
      if (!s.head) return { nodes: { ...s.nodes, [id]: node }, head: id }
      let cur = s.head
      while (s.nodes[cur].next) cur = s.nodes[cur].next!
      return {
        nodes: {
          ...s.nodes,
          [id]: node,
          [cur]: { ...s.nodes[cur], next: id },
        },
      }
    })
  },

  deleteNode: (value) => {
    set((s) => {
      const nodes = { ...s.nodes }
      if (!s.head) return s
      if (nodes[s.head].value === value) {
        const newHead = nodes[s.head].next
        delete nodes[s.head]
        return { nodes, head: newHead }
      }
      let prev = s.head
      let cur = nodes[prev].next
      while (cur) {
        if (nodes[cur].value === value) {
          nodes[prev] = { ...nodes[prev], next: nodes[cur].next }
          delete nodes[cur]
          return { nodes }
        }
        prev = cur
        cur = nodes[cur].next
      }
      return s
    })
  },

  deleteById: (id) => {
    set((s) => {
      const nodes = { ...s.nodes }
      if (!s.head) return s
      if (s.head === id) {
        const newHead = nodes[id].next
        delete nodes[id]
        return { nodes, head: newHead }
      }
      let prev = s.head
      let cur = nodes[prev].next
      while (cur) {
        if (cur === id) {
          nodes[prev] = { ...nodes[prev], next: nodes[cur].next }
          delete nodes[cur]
          return { nodes }
        }
        prev = cur
        cur = nodes[cur].next
      }
      return s
    })
  },

  reset: () => set({ nodes: {}, head: null }),

  getOrderedNodes: () => {
    const { nodes, head } = get()
    const result: LinkedListNode[] = []
    let cur = head
    while (cur) {
      result.push(nodes[cur])
      cur = nodes[cur].next
    }
    return result
  },
}))

export default useLinkedListStore
