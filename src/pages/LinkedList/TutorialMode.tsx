import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LinkedListCanvas from '../../components/LinkedList/LinkedListCanvas'
import StickFigure from '../../components/StickFigure/StickFigure'
import CodeInput, { CommandResult } from '../../components/CodeInput/CodeInput'
import useLinkedListStore from '../../store/useLinkedListStore'
import { StickFigureState } from '../../types'

interface Step {
  type: 'concept' | 'action'
  title: string
  body: string
  code?: string
  figure: StickFigureState
  hint?: string
  expected?: string // exact command required to advance
}

const STEPS: Step[] = [
  {
    type: 'concept',
    title: 'Welcome to Linked Lists!',
    body: 'A linked list stores elements in nodes, each holding a value and a pointer to the next node. Unlike arrays, nodes live anywhere in memory.',
    figure: 'pointing',
    hint: 'Press Enter to continue',
  },
  {
    type: 'concept',
    title: 'Anatomy of a Node',
    body: 'Every node has two fields:\n• value — the stored data\n• next  — a reference to the next node (or null)',
    code: 'type Node = {\n  value: number\n  next:  Node | null\n}',
    figure: 'drawing',
    hint: 'Press Enter to continue',
  },
  {
    type: 'concept',
    title: 'The HEAD Pointer',
    body: 'The list tracks a single HEAD pointer that always references the first node. Lose HEAD and you lose the entire list.',
    code: 'type LinkedList = {\n  head: Node | null\n}',
    figure: 'pointing',
    hint: 'Press Enter to continue',
  },
  {
    type: 'action',
    title: 'Insert your first node',
    body: 'Use list.append() to add the value 5. Watch it appear on the chalkboard!',
    figure: 'drawing',
    hint: 'list.append(5)',
    expected: 'list.append(5)',
  },
  {
    type: 'action',
    title: 'Add another node',
    body: 'Append 12. It gets linked at the end — the previous node\'s next pointer now points to 12.',
    code: '// after: 5 → 12 → NULL',
    figure: 'drawing',
    hint: 'list.append(12)',
    expected: 'list.append(12)',
  },
  {
    type: 'action',
    title: 'One more!',
    body: 'Append 8. Appending is O(n) — you have to walk to the tail first.',
    code: '// after: 5 → 12 → 8 → NULL',
    figure: 'drawing',
    hint: 'list.append(8)',
    expected: 'list.append(8)',
  },
  {
    type: 'action',
    title: 'Print the list',
    body: 'Walk from HEAD to NULL, printing each value. O(n) traversal.',
    code: 'function traverse(head):\n  cur = head\n  while cur != null:\n    print(cur.value)\n    cur = cur.next',
    figure: 'pointing',
    hint: 'list.print()',
    expected: 'list.print()',
  },
  {
    type: 'action',
    title: 'Delete a node',
    body: 'Remove 12. The node before it updates its next pointer to skip over 12.',
    code: 'function delete(val):\n  prev = findPrev(val)\n  prev.next = prev.next.next',
    figure: 'drawing',
    hint: 'list.delete(12)',
    expected: 'list.delete(12)',
  },
  {
    type: 'concept',
    title: 'You nailed it! 🎉',
    body: 'You learned:\n• Node anatomy (value + next)\n• HEAD pointer\n• append  — O(n)\n• delete  — O(n)\n• print   — O(n)\n\nSwitch to Challenge Mode to test your skills!',
    figure: 'celebrating',
    hint: 'Press Enter to finish',
  },
]

const TutorialMode = () => {
  const [idx, setIdx] = useState(0)
  const [leavingIds, setLeavingIds] = useState<string[]>([])
  const { insertAtHead, insertAtTail, deleteNode, reset, getOrderedNodes } = useLinkedListStore()
  const step = STEPS[idx]
  const pendingDelete = useRef<Map<number, string>>(new Map()) // value → nodeId

  useEffect(() => { reset(); setIdx(0) }, [reset])

  const advance = useCallback(() => {
    if (idx < STEPS.length - 1) setIdx(i => i + 1)
  }, [idx])

  const handleNodeLeft = useCallback((id: string) => {
    useLinkedListStore.getState().deleteById(id)
    setLeavingIds(ids => ids.filter(x => x !== id))
  }, [])

  const handleCommand = useCallback(
    (method: string, arg: number | undefined, raw: string): CommandResult => {
      const ordered = getOrderedNodes()

      if (method === 'append' || method === 'insert' || method === 'prepend') {
        if (arg === undefined) return { output: 'Provide a value: list.append(5)', status: 'error' }
        if (method === 'prepend' || method === 'insert') {
          insertAtHead(arg)
        } else {
          insertAtTail(arg)
        }
        return { output: `✓ Node ${arg} ${method === 'append' ? 'appended to end' : 'inserted at head'}`, status: 'ok' }
      }

      if (method === 'delete') {
        if (arg === undefined) return { output: 'Provide a value: list.delete(5)', status: 'error' }
        const target = getOrderedNodes().find(n => n.value === arg)
        if (!target) return { output: `✗ Value ${arg} not found in list`, status: 'error' }
        setLeavingIds(ids => [...ids, target.id])
        return { output: `✓ Deleting node ${arg}…`, status: 'ok' }
      }

      if (method === 'clear') {
        if (ordered.length === 0) return { output: 'List is already empty', status: 'info' }
        setLeavingIds(ordered.map(n => n.id))
        return { output: '✓ Clearing list…', status: 'ok' }
      }

      if (method === 'print') {
        const vals = ordered.map(n => n.value)
        if (vals.length === 0) return { output: 'List is empty', status: 'info' }
        return { output: `HEAD → ${vals.join(' → ')} → NULL`, status: 'info' }
      }

      if (method === 'length' || method === 'size') {
        return { output: `Length: ${ordered.length}`, status: 'info' }
      }

      return { output: `Unknown method: ${method}`, status: 'error' }
    },
    [getOrderedNodes, insertAtHead, insertAtTail, reset]
  )

  const handleExpectedCommand = useCallback(() => {
    advance()
  }, [advance])


  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-[288px] flex-shrink-0 flex flex-col border-r border-chalk-white/15 p-4 gap-3 overflow-y-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="font-chalk text-chalk-yellow text-sm shrink-0">
            {idx + 1} / {STEPS.length}
          </span>
          <div className="flex-1 bg-chalk-white/10 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-chalk-yellow"
              animate={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
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
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-2.5"
          >
            <h3 className="font-chalk text-chalk-yellow text-[1.15rem] leading-tight">
              {step.title}
            </h3>
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

        {/* Navigation */}
        <div className="flex flex-col gap-2">
          {/* Concept step → big Next button */}
          {step.type === 'concept' && idx < STEPS.length - 1 && (
            <button
              onClick={advance}
              className="w-full py-2.5 rounded font-chalk text-chalk-yellow border-2 border-chalk-yellow bg-chalk-yellow/15 hover:bg-chalk-yellow/25 active:scale-95 text-base font-semibold transition-all"
            >
              Next →
            </button>
          )}

          {/* Last concept step */}
          {step.type === 'concept' && idx === STEPS.length - 1 && (
            <div className="w-full py-2.5 rounded text-center font-chalk text-chalk-green text-base border border-chalk-green/40">
              Tutorial complete! 🎉
            </div>
          )}

          {/* Action step → show the command they need to type */}
          {step.type === 'action' && (
            <div className="flex flex-col gap-1.5 p-3 rounded border border-chalk-yellow/30 bg-chalk-yellow/5">
              <span className="font-hand text-chalk-white/50 text-xs">Type in the console below:</span>
              <span className="font-chalk text-chalk-yellow text-sm tracking-wide">{step.expected}</span>
            </div>
          )}

          {/* Restart link */}
          <button
            onClick={() => { reset(); setLeavingIds([]); setIdx(0) }}
            className="self-start font-chalk text-chalk-white/45 text-xs hover:text-chalk-red/70 transition-colors"
          >
            restart tutorial
          </button>
        </div>
      </div>

      {/* ── Canvas + REPL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <LinkedListCanvas leavingIds={leavingIds} onNodeLeft={handleNodeLeft} />
        </div>

        {/* Code input */}
        <div className="flex-shrink-0 h-48 border-t border-chalk-white/15 bg-black/20">
          <CodeInput
            onCommand={handleCommand}
            hint={step.type === 'action' ? step.hint : undefined}
            expectedCommand={step.type === 'action' ? step.expected : undefined}
            onExpectedCommand={step.type === 'action' ? handleExpectedCommand : undefined}
            onEmptyEnter={step.type === 'concept' ? advance : undefined}
          />
        </div>
      </div>
    </div>
  )
}

export default TutorialMode
