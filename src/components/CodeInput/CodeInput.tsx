import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CommandResult {
  output: string
  status: 'ok' | 'error' | 'info'
}

export interface CodeInputProps {
  onCommand: (method: string, arg: number | undefined, raw: string) => CommandResult
  hint?: string
  expectedCommand?: string
  onExpectedCommand?: () => void
  onEmptyEnter?: () => void
  disabled?: boolean
}

interface HistoryEntry {
  input: string
  output: string
  status: 'ok' | 'error' | 'info'
}

const METHODS = ['append', 'prepend', 'insert', 'delete', 'clear', 'print', 'length']

function parse(raw: string): { method: string; arg?: number } | null {
  const m = raw.trim().match(/^list\.([a-zA-Z]+)\s*\(([^)]*)\)\s*$/)
  if (!m) return null
  const method = m[1].toLowerCase()
  if (!METHODS.includes(method)) return null
  const argStr = m[2].trim()
  if (argStr === '') return { method }
  const arg = parseInt(argStr, 10)
  if (isNaN(arg)) return null
  return { method, arg }
}

function getAutocomplete(val: string): string {
  if (!val) return ''
  const candidates = METHODS.map(m => `list.${m}(`)
  const match = candidates.find(c => c.startsWith(val) && c !== val)
  return match ?? ''
}

const CodeInput = ({
  onCommand,
  hint,
  expectedCommand,
  onExpectedCommand,
  onEmptyEnter,
  disabled,
}: CodeInputProps) => {
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [history])

  const autocomplete = getAutocomplete(value)

  const submit = useCallback(() => {
    const raw = value.trim()
    if (!raw) { onEmptyEnter?.(); return }

    const parsed = parse(raw)
    if (!parsed) {
      setHistory(h => [
        ...h,
        {
          input: raw,
          output: 'Syntax error — try: list.append(5)  or  list.delete(5)',
          status: 'error',
        },
      ])
      setValue('')
      return
    }

    const result = onCommand(parsed.method, parsed.arg, raw)
    setHistory(h => [...h, { input: raw, output: result.output, status: result.status }])

    if (expectedCommand && raw === expectedCommand) {
      onExpectedCommand?.()
    }

    setValue('')
    setHistIdx(-1)
  }, [value, onCommand, expectedCommand, onExpectedCommand, onEmptyEnter])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (autocomplete) setValue(autocomplete)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const inputs = history.map(h => h.input).reverse()
      const next = Math.min(histIdx + 1, inputs.length - 1)
      setHistIdx(next)
      if (inputs[next]) setValue(inputs[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setValue(next === -1 ? '' : history.map(h => h.input).reverse()[next] ?? '')
    }
  }

  return (
    <div
      className="flex flex-col h-full select-none cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Log */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-1 space-y-1.5 min-h-0"
      >
        {history.length === 0 && (
          <p className="font-hand text-chalk-white/28 text-xs italic pt-1">
            Type a command and press Enter…
          </p>
        )}
        <AnimatePresence initial={false}>
          {history.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="leading-snug"
            >
              <div className="flex items-center gap-1.5 font-chalk text-[0.95rem]">
                <span className="text-chalk-yellow/55 shrink-0">›</span>
                <span className="text-chalk-white/85">{entry.input}</span>
              </div>
              <p
                className={`pl-5 font-hand text-xs mt-0.5 ${
                  entry.status === 'error'
                    ? 'text-chalk-red/80'
                    : entry.status === 'info'
                    ? 'text-chalk-blue/75'
                    : 'text-chalk-green/80'
                }`}
              >
                {entry.output}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint strip */}
      {hint && (
        <div className="px-4 py-1 border-t border-chalk-white/10 flex items-center gap-2 flex-shrink-0">
          <span className="font-hand text-chalk-white/35 text-xs">Try:</span>
          <span className="font-chalk text-chalk-yellow/70 text-xs">{hint}</span>
          {expectedCommand && (
            <span className="ml-auto font-hand text-chalk-white/25 text-xs italic">
              Type it to continue
            </span>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-t border-chalk-white/15 relative">
        <span className="text-chalk-yellow/60 font-chalk text-lg leading-none select-none">›</span>
        <div className="flex-1 relative overflow-hidden">
          {/* Ghost autocomplete — shown in blue so it's clearly distinct from input text */}
          {autocomplete && value && !disabled && (
            <span
              aria-hidden
              className="absolute inset-0 font-chalk text-[1rem] text-chalk-blue/35 pointer-events-none whitespace-pre leading-none pt-px"
            >
              {autocomplete}
            </span>
          )}
          <input
            ref={inputRef}
            value={value}
            onChange={e => { setValue(e.target.value); setHistIdx(-1) }}
            onKeyDown={handleKey}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            placeholder={disabled ? '—' : 'type a command…'}
            className="w-full bg-transparent outline-none font-chalk text-[1rem] text-chalk-white caret-chalk-yellow placeholder-chalk-white/25 disabled:opacity-30"
          />
        </div>
        {autocomplete && value && !disabled && (
          <kbd className="text-chalk-white/22 text-[10px] font-hand border border-chalk-white/20 rounded px-1 py-0.5 leading-none shrink-0">
            Tab
          </kbd>
        )}
      </div>

      {/* Method hints */}
      <div className="flex-shrink-0 flex items-center gap-2 flex-wrap px-4 pb-2.5">
        {METHODS.map(m => (
          <button
            key={m}
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              setValue(`list.${m}(`)
              inputRef.current?.focus()
            }}
            className="font-chalk text-[0.7rem] text-chalk-white/30 hover:text-chalk-blue/70 transition-colors disabled:opacity-20"
          >
            {m}()
          </button>
        ))}
      </div>
    </div>
  )
}

export default CodeInput
