import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LinkedListCanvas from '../../components/LinkedList/LinkedListCanvas'
import StickFigure from '../../components/StickFigure/StickFigure'
import useLinkedListStore from '../../store/useLinkedListStore'
import { StickFigureState } from '../../types'

interface Step {
  id: number
  title: string
  body: string
  code?: string
  figure: StickFigureState
  action?: string
}

const STEPS: Step[] = [
  {
    id: 0,
    title: 'Welcome to Linked Lists!',
    body: 'A linked list is a linear data structure where elements are stored in individual nodes. Unlike arrays, nodes are not stored contiguously in memory.',
    figure: 'pointing',
  },
  {
    id: 1,
    title: 'Anatomy of a Node',
    body: 'Every node holds two things:\n\n• DATA — the actual value\n• NEXT — a pointer (reference) to the next node in the sequence',
    code: 'type Node = {\n  value: number\n  next: Node | null\n}',
    figure: 'drawing',
  },
  {
    id: 2,
    title: 'The HEAD Pointer',
    body: 'The list tracks a single pointer called HEAD that always references the first node. Lose HEAD and you lose the entire list.',
    code: 'type LinkedList = {\n  head: Node | null\n}',
    figure: 'pointing',
  },
  {
    id: 3,
    title: 'Inserting at the Head — O(1)',
    body: "Let's insert 5. A new node is created, its NEXT is set to the old HEAD, then HEAD is updated to point to our new node.",
    code: 'function insertHead(val):\n  node = new Node(val)\n  node.next = head\n  head = node',
    figure: 'drawing',
    action: 'insert-5',
  },
  {
    id: 4,
    title: 'Insert 12',
    body: 'Inserting 12 the same way. The new node points to 5, and HEAD now points to 12. The list grows from the front.',
    code: 'insertHead(12)\n// list: 12 → 5 → NULL',
    figure: 'drawing',
    action: 'insert-12',
  },
  {
    id: 5,
    title: 'Insert 8',
    body: 'One more! Insert 8. Notice how each head insertion is constant time — no shifting like an array.',
    code: 'insertHead(8)\n// list: 8 → 12 → 5 → NULL',
    figure: 'drawing',
    action: 'insert-8',
  },
  {
    id: 6,
    title: 'Traversal — O(n)',
    body: 'To visit all nodes, start at HEAD and follow each NEXT pointer until you reach NULL. You must visit every node, so it takes O(n) time.',
    code: 'function traverse(head):\n  cur = head\n  while cur != null:\n    visit(cur.value)\n    cur = cur.next',
    figure: 'pointing',
  },
  {
    id: 7,
    title: 'Deletion — O(n)',
    body: "To delete 12, find the node before it and make its NEXT skip over 12, pointing directly to 5 instead. Watch the canvas!",
    code: 'function delete(val):\n  prev = findPrev(val)\n  prev.next = prev.next.next',
    figure: 'drawing',
    action: 'delete-12',
  },
  {
    id: 8,
    title: 'You Did It! 🎉',
    body: 'You now understand:\n\n• Node structure (data + pointer)\n• HEAD pointer\n• Insertion O(1)\n• Traversal O(n)\n• Deletion O(n)\n\nTry Challenge Mode to test your skills!',
    figure: 'celebrating',
  },
]

const TutorialMode = () => {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const { insertAtHead, deleteNode, reset, getOrderedNodes } = useLinkedListStore()
  const step = STEPS[idx]

  useEffect(() => {
    reset()
    setIdx(0)
  }, [reset])

  const applyAction = (action?: string) => {
    if (!action) return
    if (action === 'insert-5')  insertAtHead(5)
    if (action === 'insert-12') insertAtHead(12)
    if (action === 'insert-8')  insertAtHead(8)
    if (action === 'delete-12') deleteNode(12)
  }

  const handleNext = () => {
    applyAction(step.action)
    if (idx < STEPS.length - 1) setIdx((i) => i + 1)
  }

  const handlePrev = () => {
    if (idx > 0) {
      reset()
      setIdx((i) => i - 1)
    }
  }

  const handleManualInsert = () => {
    const v = parseInt(input, 10)
    if (!isNaN(v)) {
      insertAtHead(v)
      setInput('')
    }
  }

  const ordered = getOrderedNodes()

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-chalk-white/15 p-4 gap-3 overflow-y-auto">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="font-chalk text-chalk-yellow text-sm whitespace-nowrap">
            {idx + 1} / {STEPS.length}
          </span>
          <div className="flex-1 bg-chalk-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-chalk-yellow"
              animate={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        {/* Stick figure */}
        <div className="flex justify-center py-3">
          <StickFigure state={step.figure} size={82} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-2.5"
          >
            <h3 className="font-chalk text-chalk-yellow text-[1.2rem] leading-tight">{step.title}</h3>
            <p className="font-hand text-chalk-white/85 text-sm leading-relaxed whitespace-pre-line">
              {step.body}
            </p>
            {step.code && (
              <div className="bg-black/35 rounded p-3 border border-chalk-white/15">
                <p className="font-chalk text-chalk-blue text-xs mb-1">Code:</p>
                <pre className="font-hand text-chalk-white/75 text-xs whitespace-pre leading-relaxed overflow-x-auto">
                  {step.code}
                </pre>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex-1" />

        {/* Nav buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePrev}
            disabled={idx === 0}
            className="flex-1 py-2 rounded font-chalk text-chalk-white/65 border border-chalk-white/25 hover:bg-chalk-white/10 disabled:opacity-30 text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={idx === STEPS.length - 1}
            className="flex-1 py-2 rounded font-chalk text-chalkboard-dark bg-chalk-yellow hover:bg-chalk-yellow/80 disabled:opacity-30 text-sm font-semibold transition-colors"
          >
            {step.action ? 'Apply →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* ── Canvas + controls ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LinkedListCanvas />
        </div>

        {/* Bottom controls */}
        <div className="flex-shrink-0 border-t border-chalk-white/15 px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualInsert()}
            placeholder="value"
            className="w-24 px-3 py-1.5 rounded bg-black/30 border border-chalk-white/25 font-chalk text-chalk-white text-sm placeholder-chalk-white/25 focus:outline-none focus:border-chalk-yellow"
          />
          <button
            onClick={handleManualInsert}
            className="px-3 py-1.5 rounded bg-chalk-blue/15 border border-chalk-blue/45 font-chalk text-chalk-blue text-sm hover:bg-chalk-blue/25 transition-colors"
          >
            Insert at head
          </button>
          <button
            onClick={() => ordered[0] && deleteNode(ordered[0].value)}
            disabled={ordered.length === 0}
            className="px-3 py-1.5 rounded bg-chalk-red/15 border border-chalk-red/45 font-chalk text-chalk-red text-sm hover:bg-chalk-red/25 transition-colors disabled:opacity-30"
          >
            Delete head
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded bg-chalk-white/8 border border-chalk-white/20 font-chalk text-chalk-white/60 text-sm hover:bg-chalk-white/15 transition-colors"
          >
            Reset
          </button>
          <span className="ml-auto font-chalk text-chalk-white/35 text-sm">
            {ordered.length} node{ordered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TutorialMode
