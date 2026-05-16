import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TutorialMode from './TutorialMode'
import ChallengeMode from './ChallengeMode'
import { LearningMode } from '../../types'

const LinkedListPage = () => {
  const [mode, setMode] = useState<LearningMode>('tutorial')

  return (
    <div className="h-screen flex flex-col chalkboard-surface overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-chalk-white/15">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="font-chalk text-chalk-white/45 hover:text-chalk-white text-sm transition-colors"
          >
            ← Academy
          </Link>
          <h1 className="font-chalk text-chalk-yellow text-2xl leading-none">
            Linked List
          </h1>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-md border border-chalk-white/25 overflow-hidden">
          {(['tutorial', 'challenge'] as LearningMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 font-chalk text-sm capitalize transition-colors ${
                mode === m
                  ? 'bg-chalk-yellow/25 text-chalk-yellow border-b-2 border-chalk-yellow'
                  : 'text-chalk-white/55 hover:text-chalk-white hover:bg-chalk-white/8'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatedPane key={mode}>
          {mode === 'tutorial' ? <TutorialMode /> : <ChallengeMode />}
        </AnimatedPane>
      </div>
    </div>
  )
}

const AnimatedPane = ({ children, key }: { children: React.ReactNode; key: string }) => (
  <motion.div
    key={key}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.25 }}
    style={{ height: '100%' }}
  >
    {children}
  </motion.div>
)

export default LinkedListPage
