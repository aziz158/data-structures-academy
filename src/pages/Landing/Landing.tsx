import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ChalkParticles from '../../components/ChalkParticles/ChalkParticles'
import StickFigure from '../../components/StickFigure/StickFigure'

const DATA_STRUCTURES = [
  { name: 'Linked List',   path: '/linked-list',  phase: 1, live: true,  desc: 'Nodes connected through pointers',  icon: '⟷' },
  { name: 'Stack',         path: '/stack',         phase: 1, live: false, desc: 'LIFO — last in, first out',         icon: '↑' },
  { name: 'Queue',         path: '/queue',         phase: 1, live: false, desc: 'FIFO — first in, first out',        icon: '→' },
  { name: 'Binary Tree',   path: '/binary-tree',   phase: 2, live: false, desc: 'Hierarchical node structure',       icon: '⌥' },
  { name: 'BST',           path: '/bst',           phase: 2, live: false, desc: 'Sorted binary search tree',        icon: '⟁' },
  { name: 'Heap',          path: '/heap',          phase: 2, live: false, desc: 'Priority-based complete tree',      icon: '△' },
  { name: 'Hash Map',      path: '/hash-map',      phase: 3, live: false, desc: 'Key-value pair storage',           icon: '#' },
  { name: 'Graph',         path: '/graph',         phase: 3, live: false, desc: 'Vertices and weighted edges',      icon: '◯' },
  { name: 'Trie',          path: '/trie',          phase: 3, live: false, desc: 'Prefix tree for strings',          icon: '⌘' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.4 } },
}
const card = {
  hidden: { y: 28, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 90 } },
}

const Landing = () => (
  <div className="min-h-screen chalkboard-surface relative overflow-hidden">
    <ChalkParticles />

    {/* Chalkboard frame */}
    <div className="absolute inset-3 border-[3px] border-chalk-white/10 rounded-sm pointer-events-none" />
    <div className="absolute inset-5 border border-chalk-white/[0.04] rounded-sm pointer-events-none" />

    <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="flex items-end gap-8 mb-14">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <StickFigure state="pointing" size={110} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="font-chalk text-chalk-white leading-tight"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}
          >
            Data Structures
            <br />
            <span className="text-chalk-yellow">Academy</span>
          </h1>
          <p className="font-hand text-chalk-white/55 text-lg mt-2">
            Learn through animated, interactive lessons
          </p>
        </motion.div>
      </div>

      {/* Section label */}
      <motion.p
        className="font-chalk text-chalk-yellow/70 text-xl mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        — Choose a data structure —
      </motion.p>

      {/* Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {DATA_STRUCTURES.map((ds) => (
          <motion.div key={ds.name} variants={card}>
            {ds.live ? (
              <Link to={ds.path} className="block h-full">
                <Card ds={ds} />
              </Link>
            ) : (
              <Card ds={ds} />
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="text-center font-chalk text-chalk-white/25 text-sm mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        Phase 2 &amp; 3 coming soon
      </motion.p>
    </div>
  </div>
)

interface CardProps {
  ds: { name: string; live: boolean; desc: string; icon: string; phase: number }
}

const Card = ({ ds }: CardProps) => (
  <motion.div
    whileHover={ds.live ? { scale: 1.03, y: -4 } : {}}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`
      relative p-5 rounded-lg border h-full min-h-[130px] transition-colors duration-200
      ${ds.live
        ? 'border-chalk-white/40 bg-chalk-white/[0.04] hover:bg-chalk-white/[0.09] hover:border-chalk-yellow/60 cursor-pointer'
        : 'border-chalk-white/12 bg-chalk-white/[0.015] cursor-not-allowed opacity-55'
      }
    `}
  >
    {/* Phase badge */}
    <span
      className={`absolute top-3 right-3 font-chalk text-xs px-1.5 py-0.5 rounded ${
        ds.live ? 'bg-chalk-yellow/20 text-chalk-yellow' : 'bg-chalk-white/10 text-chalk-white/35'
      }`}
    >
      P{ds.phase}
    </span>

    <div className="font-chalk text-3xl text-chalk-white/40 mb-2 leading-none">{ds.icon}</div>

    <h3 className={`font-chalk text-xl mb-1 ${ds.live ? 'text-chalk-white' : 'text-chalk-white/45'}`}>
      {ds.name}
    </h3>
    <p className="font-hand text-chalk-white/38 text-sm">{ds.desc}</p>

    <div className="mt-4">
      {ds.live ? (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-chalk-green animate-pulse" />
          <span className="font-chalk text-chalk-green text-xs">Available now</span>
        </span>
      ) : (
        <span className="font-chalk text-chalk-white/22 text-xs">Coming soon</span>
      )}
    </div>

    {ds.live && (
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-chalk-yellow/25 to-transparent" />
    )}
  </motion.div>
)

export default Landing
