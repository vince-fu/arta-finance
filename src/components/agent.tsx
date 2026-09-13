import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, PaperPlaneRight, Sparkle, X } from '@phosphor-icons/react'
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { activeBrand, THEMES, type Theme } from '../lib/mockData'

/* ============================================================================
   8. AIMessageBubble / ChatSurface — Arta AI, in its Card Concierge role

   One agent, one surface, one thread. The provider lives above the whole app
   so the conversation persists across application steps and Card Home: the
   agent can be opened at step 4, closed, and re-opened from Card Home with the
   earlier exchange still there (user story 5, AC 5.1).
   ========================================================================== */

export interface AgentMessage {
  id: string
  sender: 'agent' | 'user'
  text: string
  /** Optional rich block rendered under the bubble (e.g. the payoff card). */
  render?: ReactNode
  actions?: { label: string; onClick: () => void }[]
}

interface AgentState {
  open: boolean
  messages: AgentMessage[]
  /** What the agent knows about where the member currently is. */
  context: string
  setContext: (c: string) => void
  openAgent: (seed?: AgentMessage[]) => void
  close: () => void
  push: (m: AgentMessage | AgentMessage[]) => void
  reset: () => void
}

const Ctx = createContext<AgentState | null>(null)
export const useAgent = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAgent must be used inside <AgentProvider>')
  return v
}

let seq = 0
export const msg = (sender: 'agent' | 'user', text: string, extra: Partial<AgentMessage> = {}): AgentMessage => ({
  id: `m${seq++}`,
  sender,
  text,
  ...extra,
})

export function AgentProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [context, setContext] = useState('the application')

  const value = useMemo<AgentState>(
    () => ({
      open,
      messages,
      context,
      setContext,
      openAgent: (seed) => {
        if (seed?.length) setMessages((prev) => [...prev, ...seed])
        setOpen(true)
      },
      close: () => setOpen(false),
      push: (m) => setMessages((prev) => [...prev, ...(Array.isArray(m) ? m : [m])]),
      reset: () => setMessages([]),
    }),
    [open, messages, context],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/* --- Entry badge ----------------------------------------------------------
   The same affordance the live app uses for "Talk to us" — a circular
   translucent badge in the header. It appears on every screen in this
   prototype, application steps included (user story 5, AC 5.2).            */

export function AgentBadge({
  onClick,
  variant = 'onDark',
  hasUnread,
}: {
  onClick: () => void
  variant?: 'onDark' | 'onGradient'
  hasUnread?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Ask ${activeBrand.agentName}`}
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-pill ${
        variant === 'onGradient' ? 'bg-white/20 backdrop-blur' : 'bg-white/[0.08] border border-white/10'
      }`}
    >
      <Coffee size={21} className="text-white" />
      {hasUnread && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-pill bg-positive ring-2 ring-black/40" />
      )}
    </button>
  )
}

/* --- Message bubble ------------------------------------------------------- */

export function AIMessageBubble({ m, theme }: { m: AgentMessage; theme: Theme }) {
  const isAgent = m.sender === 'agent'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
    >
      {isAgent && (
        <div className="mb-1.5 flex items-center gap-1.5 text-ink-muted">
          <Sparkle size={13} weight="fill" />
          <span className="eyebrow">{THEMES[theme].agentName}</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-md px-4 py-3 text-[14px] leading-relaxed ${
          isAgent ? 'bg-card text-ink' : 'bg-white text-black'
        }`}
      >
        {m.text}
      </div>
      {m.render && <div className="mt-3 w-full">{m.render}</div>}
      {m.actions && (
        <div className="mt-3 flex w-full flex-wrap gap-2">
          {m.actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="rounded-pill border border-white/25 px-3.5 py-2 text-[13px] font-medium text-ink active:scale-[0.98]"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* --- Chat surface --------------------------------------------------------- */

export function ChatSurface({
  theme,
  suggestions = [],
  onSend,
}: {
  theme: Theme
  suggestions?: string[]
  onSend: (text: string) => void
}) {
  const { open, close, messages, context } = useAgent()
  const [draft, setDraft] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  const send = (text: string) => {
    if (!text.trim()) return
    onSend(text.trim())
    setDraft('')
    requestAnimationFrame(() =>
      scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }),
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-50 flex h-[82%] flex-col rounded-t-[28px] border-t border-white/10 bg-bg-raised"
          >
            <div className="flex items-center gap-3 px-5 pb-3 pt-4">
              <div className="grid h-9 w-9 place-items-center rounded-pill bg-white/[0.08]">
                <Coffee size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-ink">{THEMES[theme].agentName}</p>
                {/* Context line — proof the agent knows where you are without
                    being told (user story 5, AC 5.1). */}
                <p className="text-[12px] text-ink-muted">
                  {THEMES[theme].agentRole} · {context}
                </p>
              </div>
              <button onClick={close} aria-label="Close" className="p-2 text-ink-muted">
                <X size={20} />
              </button>
            </div>

            <div ref={scroller} className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-4">
              {messages.map((m) => (
                <AIMessageBubble key={m.id} m={m} theme={theme} />
              ))}
            </div>

            {suggestions.length > 0 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 rounded-pill border border-white/20 bg-white/[0.04] px-3.5 py-2 text-[13px] text-ink-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 pb-5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(draft)}
                placeholder={`Ask ${THEMES[theme].agentName} anything about your card`}
                className="h-11 flex-1 rounded-pill border border-white/15 bg-white/[0.04] px-4 text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-white/30"
              />
              <button
                onClick={() => send(draft)}
                aria-label="Send"
                className="grid h-11 w-11 place-items-center rounded-pill bg-white text-black"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
