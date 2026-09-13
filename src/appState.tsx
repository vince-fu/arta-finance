import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { limits, member, setActiveBrand, type Theme } from './lib/mockData'

/* ============================================================================
   Navigation + application state.

   A screen-name state machine with a history stack — no router. The state also
   doubles as the "save & resume" store (user story 7a): reaching any stage
   records it, and the entry screen offers to resume from `furthest`.
   ========================================================================== */

export const SCREENS = [
  'entry',
  'getStarted',
  'confirm',
  'income',
  'setup',
  'review',
  'decision',
  'cardHome',
  'statement',
  'lifecycle',
  'brandBox',
] as const

export type ScreenId = (typeof SCREENS)[number]

/** Flow 1 as six stages — five decisions and one outcome (Ideation §2.0). Drives the stepper. */
export const FLOW1_STEPS: ScreenId[] = ['getStarted', 'confirm', 'income', 'setup', 'review', 'decision']

export type Decision = 'approved' | 'pending' | 'declined'

/** Card finish chosen at Stage 1. Identical terms either way — only how it looks. */
export type CardFinish = 'black' | 'iridescent'

interface AppState {
  screen: ScreenId
  go: (s: ScreenId) => void
  back: () => void
  canGoBack: boolean
  /** Continue to `next` — or, while editing from Review, straight back to Review. */
  advance: (next: ScreenId) => void
  /** Open stage `to` to change something, returning to `from` on save. */
  editFrom: (from: ScreenId, to: ScreenId) => void
  /** True while a stage is open for an edit from Review. */
  returning: boolean

  theme: Theme
  setTheme: (t: Theme) => void

  /* --- application data --- */
  cardFinish: CardFinish
  setCardFinish: (f: CardFinish) => void
  kyc: typeof member.kyc
  editKyc: (id: string, value: string) => void
  income: { employer: string; annual: string; other: string; status: string }
  setIncome: (v: Partial<AppState['income']>) => void
  requestedLimit: number
  setRequestedLimit: (n: number) => void
  settlementAccount: string
  setSettlementAccount: (id: string) => void
  autopay: 'full' | 'minimum' | 'off'
  setAutopay: (v: AppState['autopay']) => void
  consented: boolean
  setConsented: (v: boolean) => void
  creditCheck: boolean
  setCreditCheck: (v: boolean) => void
  signature: string
  setSignature: (v: string) => void

  /* --- demo controls (no real decisioning engine exists) --- */
  decision: Decision
  setDecision: (d: Decision) => void
  lowCash: boolean
  setLowCash: (v: boolean) => void

  /* --- save & resume --- */
  furthest: ScreenId | null
  paymentScheduled: number | null
  setPaymentScheduled: (n: number | null) => void
}

const Ctx = createContext<AppState | null>(null)
export const useApp = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppProvider>')
  return v
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ScreenId[]>(['entry'])
  const [returnTo, setReturnTo] = useState<ScreenId | null>(null)
  const [theme, setTheme] = useState<Theme>('arta')
  const [cardFinish, setCardFinish] = useState<CardFinish>('black')
  const [kyc, setKyc] = useState(member.kyc)
  const [income, setIncomeState] = useState({
    employer: member.income.employer,
    status: member.income.status,
    annual: String(member.income.annual),
    other: String(member.income.other),
  })
  const [requestedLimit, setRequestedLimit] = useState(limits.defaultRequest)
  const [settlementAccount, setSettlementAccount] = useState('cash')
  const [autopay, setAutopay] = useState<'full' | 'minimum' | 'off'>('full')
  const [consented, setConsented] = useState(false)
  const [creditCheck, setCreditCheck] = useState(false)
  const [signature, setSignature] = useState('')
  const [decision, setDecision] = useState<Decision>('approved')
  const [lowCash, setLowCash] = useState(false)
  const [furthest, setFurthest] = useState<ScreenId | null>(null)
  const [paymentScheduled, setPaymentScheduled] = useState<number | null>(null)

  const screen = stack[stack.length - 1]
  // Theme content that non-React modules read (see mockData.activeBrand).
  setActiveBrand(theme)

  const go = useCallback((s: ScreenId) => {
    // Any ordinary navigation cancels a pending "back to review".
    setReturnTo(null)
    setStack((st) => [...st, s])
    // Auto-save progress the moment a stage is reached — no explicit "save"
    // action is ever required (user story 7a, AC 7a.1).
    if (FLOW1_STEPS.includes(s) && s !== 'decision') setFurthest(s)
  }, [])

  const back = useCallback(() => {
    if (stack.length <= 1) return
    const next = stack.slice(0, -1)
    if (next[next.length - 1] === returnTo) setReturnTo(null)
    setStack(next)
  }, [stack, returnTo])

  const advance = useCallback(
    (next: ScreenId) => {
      if (!returnTo) return go(next)
      const target = returnTo
      setReturnTo(null)
      // Pop back to the existing Review entry rather than stacking a second one.
      setStack((st) => {
        const i = st.lastIndexOf(target)
        return i >= 0 ? st.slice(0, i + 1) : [...st, target]
      })
    },
    [returnTo, go],
  )

  const editFrom = useCallback((from: ScreenId, to: ScreenId) => {
    setReturnTo(from)
    // Not recorded as "furthest" — resuming should still land on Review.
    setStack((st) => [...st, to])
  }, [])

  const value = useMemo<AppState>(
    () => ({
      screen,
      go,
      back,
      canGoBack: stack.length > 1,
      advance,
      editFrom,
      returning: returnTo !== null,
      theme,
      setTheme,
      cardFinish,
      setCardFinish,
      kyc,
      editKyc: (id, val) => setKyc((k) => k.map((f) => (f.id === id ? { ...f, value: val } : f))),
      income,
      setIncome: (v) => setIncomeState((s) => ({ ...s, ...v })),
      requestedLimit,
      setRequestedLimit,
      settlementAccount,
      setSettlementAccount,
      autopay,
      setAutopay,
      consented,
      setConsented,
      creditCheck,
      setCreditCheck,
      signature,
      setSignature,
      decision,
      setDecision,
      lowCash,
      setLowCash,
      furthest,
      paymentScheduled,
      setPaymentScheduled,
    }),
    [
      screen, go, back, stack.length, advance, editFrom, returnTo, theme, cardFinish, kyc, income,
      requestedLimit, settlementAccount, autopay, consented, creditCheck, signature, decision,
      lowCash, furthest, paymentScheduled,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
