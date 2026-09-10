import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { limits, member, setActiveBrand, type Theme } from './lib/mockData'

/* ============================================================================
   Navigation + application state.

   A screen-name state machine with a history stack — no router. The state also
   doubles as the "save & resume" store (user story 7a): every step writes into
   it, and the entry screen offers to resume from `furthestStep`.
   ========================================================================== */

export const SCREENS = [
  'entry',
  'preview',
  'confirm',
  'income',
  'limit',
  'settlement',
  'keyfacts',
  'declaration',
  'review',
  'decision',
  'cardHome',
  'statement',
  'lifecycle',
  'brandBox',
] as const

export type ScreenId = (typeof SCREENS)[number]

/** The 9 numbered steps of Flow 1, for the progress stepper. */
export const FLOW1_STEPS: ScreenId[] = [
  'preview',
  'confirm',
  'income',
  'limit',
  'settlement',
  'keyfacts',
  'declaration',
  'review',
  'decision',
]

export type Decision = 'approved' | 'pending' | 'declined'

interface AppState {
  screen: ScreenId
  go: (s: ScreenId) => void
  back: () => void
  canGoBack: boolean

  theme: Theme
  setTheme: (t: Theme) => void

  /* --- application data --- */
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
  const [theme, setTheme] = useState<Theme>('arta')
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
  const [signature, setSignature] = useState('')
  const [decision, setDecision] = useState<Decision>('approved')
  const [lowCash, setLowCash] = useState(false)
  const [furthest, setFurthest] = useState<ScreenId | null>(null)
  const [paymentScheduled, setPaymentScheduled] = useState<number | null>(null)

  const screen = stack[stack.length - 1]
  // Theme content that non-React modules read (see mockData.activeBrand).
  setActiveBrand(theme)

  const go = useCallback((s: ScreenId) => {
    setStack((st) => [...st, s])
    // Auto-save progress the moment a data step is reached — no explicit
    // "save" action is ever required (user story 7a, AC 7a.1).
    if (FLOW1_STEPS.includes(s) && s !== 'decision') setFurthest(s)
  }, [])

  const back = useCallback(() => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)), [])

  const value = useMemo<AppState>(
    () => ({
      screen,
      go,
      back,
      canGoBack: stack.length > 1,
      theme,
      setTheme,
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
      screen, go, back, stack.length, theme, kyc, income, requestedLimit, settlementAccount,
      autopay, consented, signature, decision, lowCash, furthest, paymentScheduled,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
