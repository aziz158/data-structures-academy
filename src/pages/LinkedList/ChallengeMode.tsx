import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LinkedListCanvas from '../../components/LinkedList/LinkedListCanvas'
import StickFigure from '../../components/StickFigure/StickFigure'
import CodeInput, { CommandResult } from '../../components/CodeInput/CodeInput'
import useLinkedListStore from '../../store/useLinkedListStore'
import { StickFigureState, ChallengeTarget } from '../../types'

const CHALLENGES: ChallengeTarget[] = [
  { values: [1, 2, 3],       description: 'Build: 1 → 2 → 3 → NULL' },
  { values: [3, 8, 12],      description: 'Build: 3 → 8 → 12 → NULL' },
  { values: [7],              description: 'Single node with value 7' },
  { values: [5, 10, 15, 20], description: 'Build: 5 → 10 → 15 → 20 → NULL' },
  { values: [42, 17, 93, 5], description: 'Build: 42 → 17 → 93 → 5 → NULL' },
]

type Verdict = 'idle' | 'correct' | 'wrong'

const ChallengeMode = () => {
  const [cIdx, setCIdx] = useState(0)
  const [leavingIds, setLeavingIds] = useState<string[]>([])
  const [verdict, setVerdict] = useState<Verdict>('idle')
  const [figure, setFigure] = useState<StickFigureState>('idle')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())

  const { insertAtTail, insertAtHead, reset, getOrderedNodes } = useLinkedListStore()
  const challenge = CHALLENGES[cIdx]

  useEffect(() => {
    reset()
    setLeavingIds([])
    setVerdict('idle')
    setFigure('idle')
  }, [cIdx, reset])

  const handleNodeLeft = useCallback((id: string) => {
    useLinkedListStore.getState().deleteById(id)
    setLeavingIds(ids => ids.filter(x => x !== id))
  }, [])

  const handleCommand = useCallback(
    (method: string, arg: number | undefined, raw: string): CommandResult => {
      const ordered = getOrderedNodes()
      setVerdict('idle')

      if (method === 'append') {
        if (arg === undefined) return { output: 'Provide a value: list.append(5)', status: 'error' }
        insertAtTail(arg)
        setFigure('drawing')
        setTimeout(() => setFigure('idle'), 800)
        return { output: `✓ Appended ${arg} to end of list`, status: 'ok' }
      }

      if (method === 'prepend' || method === 'insert') {
        if (arg === undefined) return { output: 'Provide a value: list.prepend(5)', status: 'error' }
        insertAtHead(arg)
        setFigure('drawing')
        setTimeout(() => setFigure('idle'), 800)
        return { output: `✓ Inserted ${arg} at head`, status: 'ok' }
      }

      if (method === 'delete') {
        if (arg === undefined) return { output: 'Provide a value: list.delete(5)', status: 'error' }
        const target = getOrderedNodes().find(n => n.value === arg)
        if (!target) return { output: `✗ Value ${arg} not found`, status: 'error' }
        setLeavingIds(ids => [...ids, target.id])
        return { output: `✓ Deleting node ${arg}…`, status: 'ok' }
      }

      if (method === 'clear') {
        const ids = ordered.map(n => n.id)
        if (ids.length === 0) return { output: 'List is already empty', status: 'info' }
        setLeavingIds(ids)
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

      return { output: `Unknown: ${method}`, status: 'error' }
    },
    [getOrderedNodes, insertAtTail, insertAtHead]
  )

  const validate = () => {
    const vals = getOrderedNodes().map(n => n.value)
    const ok =
      vals.length === challenge.values.length &&
      vals.every((v, i) => v === challenge.values[i])
    setVerdict(ok ? 'correct' : 'wrong')
    setFigure(ok ? 'celebrating' : 'thinking')
    if (ok && !done.has(cIdx)) {
      setScore(s => s + 100)
      setDone(d => new Set([...d, cIdx]))
    }
  }

  const ordered = getOrderedNodes()

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel ── */}
      <div className="w-[288px] flex-shrink-0 flex flex-col border-r border-chalk-white/15 p-4 gap-3 overflow-y-auto">
        {/* Score + dots */}
        <div className="flex items-center justify-between">
          <span className="font-chalk text-chalk-yellow text-lg">Score: {score}</span>
          <div className="flex gap-1.5">
            {CHALLENGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCIdx(i)}
                className={`w-7 h-7 rounded-full font-chalk text-xs transition-all ${
                  i === cIdx
                    ? 'bg-chalk-yellow/25 border border-chalk-yellow text-chalk-yellow'
                    : done.has(i)
                    ? 'bg-chalk-green/25 border border-chalk-green/60 text-chalk-green'
                    : 'bg-chalk-white/8 border border-chalk-white/25 text-chalk-white/45'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Stick figure */}
        <div className="flex justify-center py-2">
          <StickFigure state={figure} size={82} />
        </div>

        {/* Challenge info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            <h3 className="font-chalk text-chalk-yellow text-lg">Challenge {cIdx + 1}</h3>
            <p className="font-hand text-chalk-white/85 text-sm">{challenge.description}</p>

            {/* Target */}
            <div className="bg-black/30 rounded p-3 border border-chalk-white/15">
              <p className="font-chalk text-chalk-blue text-xs mb-2">Target:</p>
              <div className="flex items-center gap-1 flex-wrap">
                {challenge.values.map((v, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="font-chalk text-chalk-yellow text-sm px-2 py-0.5 border border-chalk-yellow/45 rounded">
                      {v}
                    </span>
                    {i < challenge.values.length - 1 && (
                      <span className="font-chalk text-chalk-blue text-xs">→</span>
                    )}
                  </span>
                ))}
                <span className="font-chalk text-chalk-white/30 text-xs ml-1">→ NULL</span>
              </div>
            </div>

            {/* Your list */}
            <div className="bg-black/30 rounded p-3 border border-chalk-white/15">
              <p className="font-chalk text-chalk-blue text-xs mb-2">Your list:</p>
              <div className="flex items-center gap-1 flex-wrap min-h-7">
                {ordered.length === 0 ? (
                  <span className="font-chalk text-chalk-white/50 text-xs">Empty</span>
                ) : (
                  ordered.map((n, i) => {
                    const expected = challenge.values[i]
                    const color =
                      verdict === 'correct'
                        ? 'border-chalk-green/55 text-chalk-green'
                        : verdict === 'wrong' && n.value !== expected
                        ? 'border-chalk-red/55 text-chalk-red'
                        : 'border-chalk-white/40 text-chalk-white'
                    return (
                      <span key={n.id} className="flex items-center gap-1">
                        <span className={`font-chalk text-sm px-2 py-0.5 border rounded ${color}`}>
                          {n.value}
                        </span>
                        {i < ordered.length - 1 && (
                          <span className="font-chalk text-chalk-blue text-xs">→</span>
                        )}
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {verdict !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className={`p-3 rounded border font-hand text-sm ${
                verdict === 'correct'
                  ? 'bg-chalk-green/10 border-chalk-green/45 text-chalk-green'
                  : 'bg-chalk-red/10 border-chalk-red/45 text-chalk-red'
              }`}
            >
              {verdict === 'correct'
                ? '✓ Perfect! Your list matches the target!'
                : 'Not quite — check values and order.'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        {/* Check + Next */}
        <button
          onClick={validate}
          className="py-2 rounded font-chalk text-chalk-yellow border border-chalk-yellow/40 hover:bg-chalk-yellow/10 transition-colors text-sm"
        >
          list.check() ✓
        </button>

        <AnimatePresence>
          {verdict === 'correct' && cIdx < CHALLENGES.length - 1 && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setCIdx(i => i + 1)}
              className="py-2 rounded font-chalk text-chalk-green border-2 border-chalk-green bg-chalk-green/15 hover:bg-chalk-green/25 transition-colors text-sm"
            >
              Next Challenge →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Canvas + REPL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LinkedListCanvas leavingIds={leavingIds} onNodeLeft={handleNodeLeft} />
        </div>

        <div className="flex-shrink-0 h-48 border-t border-chalk-white/15 bg-black/20">
          <CodeInput
            onCommand={handleCommand}
            hint="append(n) · prepend(n) · delete(n) · print() · clear()"
          />
        </div>
      </div>
    </div>
  )
}

export default ChallengeMode
