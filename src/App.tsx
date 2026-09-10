import { AppProvider, SCREENS, useApp, type Decision, type ScreenId } from './appState'
import { AgentProvider, ChatSurface, msg, useAgent } from './components/agent'
import { VIEWPORT } from './components/chrome'
import {
  ConfirmScreen,
  DeclarationScreen,
  DecisionScreen,
  EntryScreen,
  IncomeScreen,
  KeyFactsScreen,
  LimitScreen,
  PreviewScreen,
  ReviewScreen,
  SettlementScreen,
} from './screens/flow1'
import { CardHomeScreen, LifecycleScreen, StatementScreen, answerFollowUp } from './screens/flow2'
import { BrandInABoxScreen } from './screens/BrandInABox'
import { THEMES } from './lib/mockData'
import { cashAccount } from './lib/payoff'

const SCREEN_LABELS: Record<ScreenId, string> = {
  entry: '1 · Entry',
  preview: '2 · No-Risk Preview',
  confirm: '3 · Already Yours',
  income: '4 · Ask With Care',
  limit: '5 · Requested limit',
  settlement: '6 · Settlement',
  keyfacts: '7 · Plain as Day',
  declaration: '8 · Declaration',
  review: '9 · Review',
  decision: '10 · Decision',
  cardHome: '11 · Card Home',
  statement: '12 · Smart Payoff',
  lifecycle: '13 · Lifecycle map',
  brandBox: '14 · Brand-in-a-Box',
}

function Screens() {
  const { screen } = useApp()
  switch (screen) {
    case 'entry': return <EntryScreen />
    case 'preview': return <PreviewScreen />
    case 'confirm': return <ConfirmScreen />
    case 'income': return <IncomeScreen />
    case 'limit': return <LimitScreen />
    case 'settlement': return <SettlementScreen />
    case 'keyfacts': return <KeyFactsScreen />
    case 'declaration': return <DeclarationScreen />
    case 'review': return <ReviewScreen />
    case 'decision': return <DecisionScreen />
    case 'cardHome': return <CardHomeScreen />
    case 'statement': return <StatementScreen />
    case 'lifecycle': return <LifecycleScreen />
    case 'brandBox': return <BrandInABoxScreen />
  }
}

/** The chat surface is mounted once, above every screen — one agent, one
 *  surface, one thread, everywhere (user story 5). */
function Agent() {
  const { theme, lowCash } = useApp()
  const { push } = useAgent()
  return (
    <ChatSurface
      theme={theme}
      suggestions={['What if I pay half now?', 'Why not keep the cash invested?', 'What is the APR?']}
      onSend={(text) => {
        push(msg('user', text))
        setTimeout(
          () => push(msg('agent', answerFollowUp(text, lowCash ? 900 : cashAccount.balance))),
          420,
        )
      }}
    />
  )
}

function Phone() {
  const { theme, screen } = useApp()
  return (
    <div
      data-theme={theme}
      style={{ width: VIEWPORT.w, height: VIEWPORT.h }}
      className="relative shrink-0 overflow-hidden rounded-[46px] bg-bg shadow-[0_40px_90px_-25px_rgba(0,0,0,0.55)] ring-1 ring-black/10"
    >
      {/* Screen-level motion lives inside each screen (StepShell), so the
          frame itself never gates visibility on an animation completing. */}
      <div key={screen} className="h-full">
        <Screens />
      </div>
      <Agent />
    </div>
  )
}

/* --- Demo controls -------------------------------------------------------
   Outside the phone, on the desktop backdrop. There is no decisioning engine
   behind this prototype, so the decision outcome is a switch — that is a
   deliberate, stated limitation, not a hidden one.                         */

/** A light-surface switch for the demo panel — the in-app `Toggle` is built
 *  for dark surfaces and would disappear here. */
function LightSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`h-6 w-11 shrink-0 rounded-full p-[3px] transition-colors ${
        on ? 'bg-neutral-900' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

function DemoPanel() {
  const {
    screen, go, theme, setTheme, decision, setDecision, lowCash, setLowCash,
    setPaymentScheduled,
  } = useApp()
  const { reset, close } = useAgent()

  return (
    <aside className="w-[264px] shrink-0 self-start rounded-2xl bg-white/70 p-5 text-[13px] text-neutral-800 shadow-sm ring-1 ring-black/5 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Demo controls
      </p>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Screen
      </p>
      <div className="mt-2 space-y-1">
        {SCREENS.map((s) => (
          <button
            key={s}
            onClick={() => go(s)}
            className={`block w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
              screen === s ? 'bg-neutral-900 text-white' : 'hover:bg-black/5'
            }`}
          >
            {SCREEN_LABELS[s]}
          </button>
        ))}
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        Decision outcome
      </p>
      <div className="mt-2 flex gap-1">
        {(['approved', 'pending', 'declined'] as Decision[]).map((d) => (
          <button
            key={d}
            onClick={() => setDecision(d)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[12px] capitalize ${
              decision === d ? 'bg-neutral-900 text-white' : 'bg-black/5'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">
        Also drives the “not eligible yet” preview outcome.
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="font-medium">Partner theme</p>
          <p className="text-[11px] text-neutral-500">{THEMES[theme].brandName}</p>
        </div>
        <LightSwitch on={theme === 'meridian'} onChange={(v) => setTheme(v ? 'meridian' : 'arta')} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Low cash balance</p>
          <p className="text-[11px] text-neutral-500">
            {lowCash ? '$900' : `$${cashAccount.balance.toLocaleString()}`} in {THEMES[theme].cashName}
          </p>
        </div>
        <LightSwitch on={lowCash} onChange={setLowCash} />
      </div>

      <button
        onClick={() => {
          reset()
          close()
          setPaymentScheduled(null)
          go('entry')
        }}
        className="mt-5 w-full rounded-lg bg-black/5 py-2 font-medium hover:bg-black/10"
      >
        Reset demo
      </button>
    </aside>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AgentProvider>
        <div className="flex min-h-screen items-center justify-center gap-10 p-10">
          <Phone />
          <DemoPanel />
        </div>
      </AgentProvider>
    </AppProvider>
  )
}
