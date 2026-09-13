import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  LockSimple,
  PencilSimple,
  PaperPlaneTilt,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from '@phosphor-icons/react'

import { useApp, type CardFinish, type ScreenId } from '../appState'
import { StepShell } from './StepShell'
import { AgentBadge, msg, useAgent } from '../components/agent'
import { KeyFactsCard, ReassuranceModule } from '../components/DisclosureCard'
import { ArtaLetterA, CardArt } from '../components/CardArt'
import {
  Eyebrow,
  GradientPanel,
  PillButton,
  ScreenTitle,
  StatFooterBar,
  Surface,
} from '../components/primitives'
import { ActionBar, Checkbox, Field, ScrollArea, StatusBar } from '../components/chrome'
import { accounts, cardTerms, limits, member, THEMES } from '../lib/mockData'
import { cashName, minimumOnlyPayoff, money0, pa } from '../lib/payoff'

/* ==========================================================================
   Flow 1 — the application, as six stages (Arta-Card-Ideation.md §2.0).

     Entry  →  1 Get started  →  2 Confirm your details  →  3 Income & employment
            →  4 Set up your card  →  5 Review, disclosures & sign  →  6 Decision

   Five real decisions and one outcome, grouped by emotional weight rather
   than by data type.
   ========================================================================== */

/** Primary-action label while a stage is open for an edit from Review. */
const saveLabel = (returning: boolean, label: string) => (returning ? 'Save & back to review' : label)

/** The settlement account carries the brand, so its label follows the theme. */
const accountName = (a: (typeof accounts)[number]) => (a.id === 'cash' ? cashName() : a.name)

const FINISHES: { id: CardFinish; label: string }[] = [
  { id: 'black', label: 'Black' },
  { id: 'iridescent', label: 'Iridescent' },
]

/* ==========================================================================
   ENTRY — the front door, before any stage
   ========================================================================== */

export function EntryScreen() {
  const { go, furthest, theme } = useApp()
  const { openAgent, setContext } = useAgent()
  const t = THEMES[theme]

  return (
    <GradientPanel gradient="hero" className="h-full">
      <StatusBar />
      <div className="flex items-center gap-3 px-6 pb-8 pt-2">
        <div className="grid h-11 w-11 place-items-center rounded-pill bg-white/20 backdrop-blur">
          {/* Arta's own "a" from its wordmark; a partner keeps its own mark. */}
          {theme === 'arta' ? (
            <ArtaLetterA size={21} className="text-white" />
          ) : (
            <span className="hero-type text-[24px] font-semibold text-white">{t.mark}</span>
          )}
        </div>
        <p className="text-[15px] font-medium text-white/90">{member.greeting}</p>
        <div className="ml-auto">
          <AgentBadge
            variant="onGradient"
            onClick={() => {
              setContext('the card, before you apply')
              openAgent([
                msg(
                  'agent',
                  `Hi ${member.firstName}. Based on what ${t.brandName} already knows about you, you look likely to be eligible — and checking leaves no enquiry on your Credit Bureau Singapore report. Want me to run it?`,
                  { actions: [{ label: 'Run the check', onClick: () => go('getStarted') }] },
                ),
              ])
            }}
          />
        </div>
      </div>

      <div className="flex-1 px-6">
        <h1 className="hero-type text-[42px] text-white">
          a card that
          <br />
          already knows
          <br />
          you
        </h1>
        <p className="mt-6 max-w-[300px] text-[15px] leading-relaxed text-white/80">
          {t.cardName} draws on what you've already given {t.brandName} — so applying is mostly
          reviewing, not typing.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {['2% cash back', 'No annual fee', 'No FX fee'].map((chip) => (
            <span key={chip} className="frost rounded-pill px-4 py-2 text-[13px] font-medium text-white">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="mb-4 flex items-center gap-2 text-white/85">
          <ShieldCheck size={17} weight="fill" />
          <span className="text-[13px] font-medium">
            Checking your eligibility leaves no enquiry on your CBS credit report.
          </span>
        </div>
        <PillButton full icon={<PaperPlaneTilt size={18} weight="fill" />} onClick={() => go('getStarted')}>
          Check if I'm eligible
        </PillButton>
        {/* Save & resume — offered only when there is real progress to resume. */}
        {furthest && (
          <button
            onClick={() => go(furthest)}
            className="mt-3 w-full rounded-pill py-3 text-[14px] font-medium text-white/85"
          >
            Continue your application →
          </button>
        )}
      </div>
    </GradientPanel>
  )
}

/* ==========================================================================
   STAGE 1 · GET STARTED — pre-qualification result + card choice
   Both are pre-commitment choices with no data entry, so they share a screen.
   ========================================================================== */

export function GetStartedScreen() {
  const { go, advance, decision, returning, cardFinish, setCardFinish } = useApp()
  // Returning from Review to change the card? The check has already run.
  const [phase, setPhase] = useState<'checking' | 'done'>(returning ? 'done' : 'checking')
  // The declined dev-state also drives the "not eligible right now" outcome,
  // so AC 4.3 is reachable in the demo.
  const eligible = decision !== 'declined'

  useEffect(() => {
    if (phase === 'done') return
    const id = setTimeout(() => setPhase('done'), 1900)
    return () => clearTimeout(id)
  }, [phase])

  return (
    <StepShell
      screen="getStarted"
      title="Get started"
      agentContext="your eligibility preview"
      agentOpener="This check only reads what Arta already holds — Credit Bureau Singapore is not contacted, so nothing appears on your credit report. Both card finishes carry identical terms, so pick the one you like."
      action={
        phase === 'done' && eligible ? (
          <PillButton full icon={returning ? undefined : <ArrowRight size={18} />} onClick={() => advance('confirm')}>
            {saveLabel(returning, 'Continue to apply')}
          </PillButton>
        ) : phase === 'done' ? (
          <PillButton full variant="outline" onClick={() => go('entry')}>
            Set a reminder for 90 days
          </PillButton>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'checking' ? (
          <motion.div key="checking" exit={{ opacity: 0 }} className="pt-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              className="mb-8 grid h-14 w-14 place-items-center rounded-pill border border-white/15"
            >
              <Sparkle size={24} weight="fill" className="text-ink" />
            </motion.div>
            <h1 className="hero-type text-[30px] text-ink">checking what you'd likely get</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Reading your portfolio, cash and payment history. Credit Bureau Singapore is not being contacted.
            </p>
            <div className="mt-6 flex items-center gap-2 text-positive">
              <ShieldCheck size={16} weight="fill" />
              <span className="text-[13px] font-medium">No enquiry on your CBS credit report</span>
            </div>
          </motion.div>
        ) : eligible ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Eyebrow>You're likely eligible for up to</Eyebrow>
            <p className="tabular mt-2 text-[44px] font-semibold leading-none text-ink">
              {money0(limits.prequalifiedCeiling)}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              An estimate, based on your {money0(member.portfolioValue)} portfolio and your Arta cash
              history. Your final limit is confirmed when you apply.
            </p>

            <div className="mt-7">
              <CardChoice value={cardFinish} onChange={setCardFinish} />
            </div>

            <div className="mt-6 space-y-3">
              {[
                ['Interest rate (EIR)', pa(cardTerms.eir)],
                ['Annual fee', 'None'],
                ['Rewards', '2% cash back on everything'],
              ].map(([l, v]) => (
                <Surface key={l} className="flex items-center justify-between py-3.5">
                  <span className="text-[14px] text-ink-muted">{l}</span>
                  <span className="tabular text-[14px] font-semibold text-ink">{v}</span>
                </Surface>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-md border border-positive/25 bg-positive/[0.07] p-4">
              <ShieldCheck size={18} weight="fill" className="mt-[1px] shrink-0 text-positive" />
              <p className="text-[13px] leading-relaxed text-ink-muted">
                This check left no enquiry on your CBS credit report. Submitting an application does —
                we'll tell you before that happens.
              </p>
            </div>
          </motion.div>
        ) : (
          /* AC 4.3 — honest, non-punitive, never a dead end. */
          <motion.div key="no" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 grid h-12 w-12 place-items-center rounded-pill bg-white/[0.08]">
              <Clock size={22} className="text-ink" />
            </div>
            <h1 className="hero-type text-[30px] text-ink">not quite yet</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Your Arta account is 4 months old. The card programme asks for 6 months of history
              before a first limit is set — that's the only thing standing in the way.
            </p>
            <Surface className="mt-6">
              <Eyebrow>What would change this</Eyebrow>
              <p className="mt-2 text-[14px] leading-relaxed text-ink">
                Two more months of account history. We'll check again automatically on 9 November and
                let you know — you don't need to do anything.
              </p>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  )
}

/** Card selection — two finishes of the same card, previewed with the real card art. */
function CardChoice({ value, onChange }: { value: CardFinish; onChange: (f: CardFinish) => void }) {
  const { theme, kyc } = useApp()
  return (
    <div>
      <Eyebrow className="mb-3">Choose your card</Eyebrow>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Card finish">
        {FINISHES.map((f) => {
          const on = f.id === value
          return (
            <button
              key={f.id}
              role="radio"
              aria-checked={on}
              onClick={() => onChange(f.id)}
              className={`rounded-md border p-2 pb-3 text-left transition-colors ${
                on ? 'border-white/45 bg-white/[0.07]' : 'border-white/[0.08] bg-card'
              }`}
            >
              {/* The full-size card art (342px wide) scaled to fit the tile. */}
              <div className="relative h-[95px] w-full overflow-hidden rounded-[9px]">
                <div className="absolute left-0 top-0 w-[342px] origin-top-left" style={{ transform: 'scale(0.4415)' }}>
                  <CardArt
                    theme={theme}
                    finish={f.id}
                    sheen={false}
                    holder={kyc[0].value.toUpperCase()}
                    last4="4429"
                  />
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between px-1">
                <span className="text-[14px] font-semibold text-ink">{f.label}</span>
                <span
                  className={`grid h-4 w-4 place-items-center rounded-pill border-2 ${
                    on ? 'border-white' : 'border-white/25'
                  }`}
                >
                  {on && <span className="h-1.5 w-1.5 rounded-pill bg-white" />}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-2.5 text-[12px] leading-snug text-ink-faint">
        Both finishes carry the same rates, fees and rewards — this only changes how it looks.
      </p>
    </div>
  )
}

/* ==========================================================================
   STAGE 2 · CONFIRM YOUR DETAILS — Already Yours
   ========================================================================== */

export function ConfirmScreen() {
  const { advance, returning, kyc, editKyc } = useApp()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  return (
    <StepShell
      screen="confirm"
      title="Confirm your details"
      agentContext="confirming your details"
      agentOpener="Everything on this step came from the KYC you completed when you joined Arta. Nothing here is a new question — correct anything that's out of date and we'll carry it forward."
      action={
        <PillButton full onClick={() => advance('income')}>
          {saveLabel(returning, 'Confirm — all correct')}
        </PillButton>
      }
    >
      <ScreenTitle sub="We already hold all of this. Read it, fix anything that's changed, and move on — you won't be asked for any of it again.">
        we already
        <br />
        know you
      </ScreenTitle>

      <div className="mb-5 flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
        <CheckCircle size={18} weight="fill" className="shrink-0 text-positive" />
        <p className="text-[13px] leading-snug text-ink-muted">
          <span className="font-semibold text-ink">8 fields pre-filled</span> from your Arta profile,
          verified with Singpass MyInfo when you joined — nothing to retype.
        </p>
      </div>

      <div className="divide-y divide-white/[0.07] overflow-hidden rounded-md border border-white/[0.08] bg-card">
        {kyc.map((f) => {
          const isEditing = editing === f.id
          return (
            <div key={f.id} className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-ink-faint">{f.label}</p>
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          editKyc(f.id, draft)
                          setEditing(null)
                        }
                      }}
                      className="mt-1.5 w-full rounded-xs border border-white/25 bg-white/[0.06] px-2.5 py-1.5 text-[15px] text-ink outline-none"
                    />
                  ) : (
                    <p className="mt-1 break-words text-[15px] leading-snug text-ink">{f.value}</p>
                  )}
                </div>
                {isEditing ? (
                  <button
                    onClick={() => {
                      editKyc(f.id, draft)
                      setEditing(null)
                    }}
                    className="shrink-0 rounded-pill bg-white px-3 py-1.5 text-[12px] font-semibold text-black"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDraft(f.value)
                      setEditing(f.id)
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-pill border border-white/20 px-3 py-1.5 text-[12px] font-medium text-ink-muted"
                  >
                    <PencilSimple size={12} /> Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
        Editing a field here updates it for this application only. Your Arta profile is updated
        separately, after a short verification.
      </p>
    </StepShell>
  )
}

/* ==========================================================================
   STAGE 3 · INCOME & EMPLOYMENT — Ask With Care
   ========================================================================== */

export function IncomeScreen() {
  const { advance, returning, income, setIncome } = useApp()
  const [mode, setMode] = useState<'linked' | 'manual'>('linked')

  return (
    <StepShell
      screen="income"
      title="Income & employment"
      agentContext="your income step"
      agentOpener="This is the one step where we ask for something new. It goes to the affordability check our issuing bank has to run — nowhere else. Want me to explain what 'other income' should include?"
      action={
        <PillButton full onClick={() => advance('setup')} disabled={!income.annual}>
          {saveLabel(returning, 'Continue')}
        </PillButton>
      }
    >
      <ScreenTitle sub="The one thing Arta doesn't already know. It sets your limit — and nothing else.">
        about your
        <br />
        income
      </ScreenTitle>

      <div className="mb-5 flex rounded-pill border border-white/12 bg-white/[0.04] p-1">
        {(
          [
            ['linked', 'Use linked data'],
            ['manual', 'Enter manually'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`relative flex-1 rounded-pill py-2.5 text-[13px] font-semibold ${
              mode === id ? 'text-black' : 'text-ink-muted'
            }`}
          >
            {mode === id && (
              <motion.span
                layoutId="income-mode"
                className="absolute inset-0 rounded-pill bg-white"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {mode === 'linked' && (
        <div className="mb-4 flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
          <CheckCircle size={18} weight="fill" className="shrink-0 text-positive" />
          <p className="text-[13px] leading-snug text-ink-muted">
            Pre-filled from your latest IRAS Notice of Assessment, retrieved through Singpass MyInfo.
            Correct it if it's out of date.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <Field label="Employer" value={income.employer} onChange={(v) => setIncome({ employer: v })} />
        <Field label="Employment status" value={income.status} onChange={(v) => setIncome({ status: v })} />
        <Field
          label="Annual assessable income (SGD)"
          prefix="S$"
          value={Number(income.annual || 0).toLocaleString('en-US')}
          onChange={(v) => setIncome({ annual: v.replace(/[^0-9]/g, '') })}
          hint="As shown on your latest IRAS Notice of Assessment."
        />
        <Field
          label="Other annual income (SGD)"
          prefix="S$"
          value={Number(income.other || 0).toLocaleString('en-US')}
          onChange={(v) => setIncome({ other: v.replace(/[^0-9]/g, '') })}
          hint="Rental, dividends, trust distributions. Optional."
        />
      </div>

      {/* The Ask With Care module — same component, reused on any sensitive step. */}
      <div className="mt-5">
        <ReassuranceModule what="your income" />
      </div>
    </StepShell>
  )
}

/* ==========================================================================
   STAGE 4 · SET UP YOUR CARD — credit limit + settlement & auto-debit
   Two fast, low-anxiety choices Arta already has a suggestion for. This is
   where Plain as Day first appears, collapsed, alongside the limit slider.
   ========================================================================== */

export function SetupScreen() {
  const {
    advance,
    returning,
    requestedLimit,
    setRequestedLimit,
    settlementAccount,
    setSettlementAccount,
    autopay,
    setAutopay,
  } = useApp()
  const pct = (requestedLimit - limits.min) / (limits.prequalifiedCeiling - limits.min)
  const atMax = requestedLimit >= limits.prequalifiedCeiling

  return (
    <StepShell
      screen="setup"
      title="Set up your card"
      agentContext="setting up your card"
      agentOpener={`A higher limit doesn't cost more — it only costs you if you carry a balance. And paying your full balance by auto-debit means you never pay interest or a late payment fee. At an EIR of ${pa(cardTerms.eir)}, that beats keeping the cash invested.`}
      action={
        <PillButton full onClick={() => advance('review')}>
          {saveLabel(returning, 'Continue')}
        </PillButton>
      }
    >
      <ScreenTitle sub="Two quick choices, both already suggested from what Arta knows. Keep them or change either.">
        set up
        <br />
        your card
      </ScreenTitle>

      {/* --- Credit limit --- */}
      <Eyebrow>Credit limit</Eyebrow>
      <p className="tabular mt-2 text-[40px] font-semibold leading-none text-ink">
        {money0(requestedLimit)}
      </p>

      <div className="mt-6">
        <input
          type="range"
          aria-label="Requested credit limit"
          className="limit-slider"
          min={limits.min}
          max={limits.prequalifiedCeiling}
          step={limits.step}
          value={requestedLimit}
          onChange={(e) => setRequestedLimit(Number(e.target.value))}
          style={
            {
              // Same visual language as AllocationBar: a filled proportion of a
              // rounded track, brand accent on the used portion.
              '--slider-track': `linear-gradient(to right, rgb(var(--accent-brand-alt)) 0%, rgb(var(--accent-brand)) ${
                pct * 100
              }%, rgb(255 255 255 / 0.15) ${pct * 100}%)`,
            } as React.CSSProperties
          }
        />
        <div className="mt-1 flex justify-between">
          <span className="tabular text-[12px] text-ink-faint">{money0(limits.min)}</span>
          <span className="tabular text-[12px] text-ink-faint">
            {money0(limits.prequalifiedCeiling)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-md border border-white/10 bg-white/[0.04] p-4">
        <Sparkle size={17} weight="fill" className="mt-[2px] shrink-0 text-ink" />
        <p className="text-[13px] leading-relaxed text-ink-muted">
          {atMax
            ? `${money0(limits.prequalifiedCeiling)} is the ceiling your profile supports today. It can be reviewed after six statements.`
            : `Your profile supports up to ${money0(limits.prequalifiedCeiling)}. Requesting more than you need has no downside — interest is only charged on what you carry.`}
        </p>
      </div>

      {/* "Plain as Day" first appears here, collapsed, and stays through Stage 5. */}
      <div className="mt-4">
        <KeyFactsCard />
      </div>

      {/* --- Settlement --- */}
      <Eyebrow className="mb-3 mt-8">Pay your statement from</Eyebrow>
      <div className="space-y-2.5">
        {accounts.map((a) => {
          const on = a.id === settlementAccount
          return (
            <button
              key={a.id}
              onClick={() => setSettlementAccount(a.id)}
              className={`flex w-full items-center gap-3 rounded-md border p-4 text-left transition-colors ${
                on ? 'border-white/40 bg-white/[0.07]' : 'border-white/[0.08] bg-card'
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-pill border-2 ${
                  on ? 'border-white' : 'border-white/25'
                }`}
              >
                {on && <span className="h-2.5 w-2.5 rounded-pill bg-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-ink">{accountName(a)}</p>
                  {a.preferred && (
                    <span className="rounded-pill bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                      Suggested
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-ink-faint">{a.detail}</p>
              </div>
              <p className="tabular text-[14px] font-semibold text-ink">{money0(a.balance)}</p>
            </button>
          )
        })}
      </div>

      {/* --- Auto-debit --- */}
      <Eyebrow className="mb-3 mt-7">Auto-debit</Eyebrow>
      <div className="overflow-hidden rounded-md border border-white/[0.08] bg-card">
        {(
          [
            ['full', 'Full statement balance', 'No interest charged. Suggested.'],
            ['minimum', 'Minimum payment only', 'Avoids the late payment fee. Interest applies to the rest.'],
            ['off', 'Off', "You'll pay manually each month."],
          ] as const
        ).map(([id, label, detail], i) => (
          <button
            key={id}
            onClick={() => setAutopay(id)}
            className={`flex w-full items-start gap-3 p-4 text-left ${i > 0 ? 'border-t border-white/[0.07]' : ''}`}
          >
            <span
              className={`mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-pill border-2 ${
                autopay === id ? 'border-white' : 'border-white/25'
              }`}
            >
              {autopay === id && <span className="h-2.5 w-2.5 rounded-pill bg-white" />}
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink">{label}</p>
              <p className="mt-0.5 text-[12px] text-ink-faint">{detail}</p>
            </div>
          </button>
        ))}
      </div>
    </StepShell>
  )
}

/* ==========================================================================
   STAGE 5 · REVIEW, DISCLOSURES & SIGN
   A recap and a signature, not a first read: the key facts have been visible
   since Stage 4. Edits open the relevant stage and return here on save.
   ========================================================================== */

export function ReviewScreen() {
  const {
    go,
    editFrom,
    kyc,
    income,
    requestedLimit,
    settlementAccount,
    autopay,
    cardFinish,
    consented,
    setConsented,
    creditCheck,
    setCreditCheck,
    signature,
    setSignature,
  } = useApp()
  const account = accounts.find((a) => a.id === settlementAccount)!
  const ready = consented && creditCheck && signature.trim().length > 3
  // Computed from the card's own EIR and minimum-payment rule, not typed in.
  const minOnly = minimumOnlyPayoff(5000)
  const field = (id: string) => kyc.find((f) => f.id === id)?.value ?? ''

  const rows: { label: string; value: string; to: ScreenId }[] = [
    { label: 'Card', value: FINISHES.find((f) => f.id === cardFinish)!.label, to: 'getStarted' },
    { label: 'Legal name', value: field('name'), to: 'confirm' },
    { label: 'Tax residence', value: field('tax'), to: 'confirm' },
    { label: 'Employer', value: income.employer, to: 'income' },
    { label: 'Annual income', value: money0(Number(income.annual)), to: 'income' },
    { label: 'Credit limit', value: money0(requestedLimit), to: 'setup' },
    { label: 'Pays from', value: accountName(account), to: 'setup' },
    {
      label: 'Auto-debit',
      value: autopay === 'full' ? 'Full balance' : autopay === 'minimum' ? 'Minimum payment' : 'Off',
      to: 'setup',
    },
  ]

  return (
    <StepShell
      screen="review"
      title="Review & sign"
      agentContext="your review and signature"
      agentOpener="Nothing on this page is new — the key facts are the same ones that came with you from Set up your card. Ask me to restate any line plainly before you sign."
      action={
        <PillButton full disabled={!ready} onClick={() => go('decision')}>
          Sign & submit
        </PillButton>
      }
    >
      <ScreenTitle sub="Everything you've told us, the full cost of the card, and your signature. Nothing here is new.">
        review
        <br />& sign
      </ScreenTitle>

      {/* --- Recap --- */}
      <Eyebrow className="mb-3">Your application</Eyebrow>
      <div className="divide-y divide-white/[0.07] overflow-hidden rounded-md border border-white/[0.08] bg-card">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-ink-faint">{r.label}</p>
              <p className="mt-1 break-words text-[15px] text-ink">{r.value}</p>
            </div>
            <button
              onClick={() => editFrom('review', r.to)}
              aria-label={`Edit ${r.label.toLowerCase()}`}
              className="flex shrink-0 items-center gap-1 rounded-pill border border-white/20 px-3 py-1.5 text-[12px] font-medium text-ink-muted"
            >
              <PencilSimple size={12} /> Edit
            </button>
          </div>
        ))}
      </div>

      {/* --- Disclosures --- */}
      <Eyebrow className="mb-3 mt-8">What it costs</Eyebrow>
      <KeyFactsCard />
      <div className="mt-3 flex items-start gap-2.5 rounded-md border border-white/10 bg-white/[0.04] p-4">
        <WarningCircle size={18} className="mt-[1px] shrink-0 text-warning" />
        <p className="text-[13px] leading-relaxed text-ink-muted">
          If you pay only the minimum on a {money0(5000)} balance, it would take about{' '}
          {Math.round(minOnly.years)} years to clear and cost about {money0(minOnly.interest)} in
          interest.
        </p>
      </div>

      {/* --- Declaration & e-sign --- */}
      <Eyebrow className="mb-3 mt-8">Declaration</Eyebrow>
      {/* AC 3.3 — the declaration points at the SAME key-facts card above,
          not a second, duplicate wall of disclosure text. */}
      <div className="space-y-4 rounded-md border border-white/[0.08] bg-card p-4">
        <Checkbox checked={consented} onChange={setConsented}>
          I confirm the information above is accurate and complete, and I accept the terms set out in
          the key facts.
        </Checkbox>
        <Checkbox checked={creditCheck} onChange={setCreditCheck}>
          I consent to a credit report enquiry with Credit Bureau Singapore (CBS).{' '}
          <span className="text-ink">This enquiry will appear on your CBS report</span> — unlike the
          eligibility preview you ran earlier.
        </Checkbox>
      </div>

      <div className="mt-5">
        <Field
          label="Type your full name to sign"
          value={signature}
          onChange={setSignature}
          placeholder="Vince Foo"
        />
        <div className="mt-3 flex items-center gap-2 text-ink-faint">
          <LockSimple size={14} weight="fill" />
          <span className="text-[12px]">
            Signed electronically. A copy is emailed to you and kept in your documents.
          </span>
        </div>
      </div>
    </StepShell>
  )
}

/* ==========================================================================
   STAGE 6 · DECISION — approved / pending / declined  ("Never Left Hanging")
   ========================================================================== */

export function DecisionScreen() {
  const { decision, go, requestedLimit, theme } = useApp()
  const { openAgent, setContext } = useAgent()
  const t = THEMES[theme]
  const approvedLimit = Math.min(requestedLimit, limits.approved)

  if (decision === 'approved') return <ApprovedScreen limit={approvedLimit} />

  const pending = decision === 'pending'

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <ScrollArea className="pt-8">
        <div
          className={`mb-6 grid h-14 w-14 place-items-center rounded-pill ${
            pending ? 'bg-white/[0.08]' : 'bg-warning/15'
          }`}
        >
          {pending ? (
            <Clock size={26} className="text-ink" />
          ) : (
            <WarningCircle size={26} className="text-warning" />
          )}
        </div>

        <h1 className="hero-type text-[32px] text-ink">
          {pending ? (
            <>
              we're taking
              <br />a closer look
            </>
          ) : (
            <>
              one thing
              <br />
              is missing
            </>
          )}
        </h1>

        {/* AC 7b.2 / 7b.3 — a specific timeframe, or the specific missing item.
            Never a generic "please wait". */}
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          {pending
            ? 'Your requested limit is above what we approve instantly, so a credit officer is reviewing it with your CBS credit report.'
            : "We couldn't verify your Singapore address against the document on file — it lists your previous address at 42 Duxton Road."}
        </p>

        <Surface className="mt-6">
          <Eyebrow>{pending ? 'Expected by' : 'What we need'}</Eyebrow>
          <p className="mt-2 text-[17px] font-semibold text-ink">
            {pending ? 'Thursday 11 September, 5pm SGT' : 'One proof of address, dated in the last 3 months'}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {pending
              ? "That's 2 business days. We'll notify you the moment it moves — you don't need to check back."
              : 'A bank statement, utility bill or tenancy agreement. Nothing else in your application changes.'}
          </p>
        </Surface>

        <div className="mt-4 rounded-md border border-white/[0.08] bg-card p-4">
          <Eyebrow>Your application is safe</Eyebrow>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Everything you entered is saved. {pending ? 'Nothing is needed from you.' : 'You are not starting over.'}
          </p>
        </div>
      </ScrollArea>

      <ActionBar>
        <PillButton full onClick={() => (pending ? go('cardHome') : go('confirm'))}>
          {pending ? 'Back to my portfolio' : 'Upload proof of address'}
        </PillButton>
        <button
          onClick={() => {
            setContext(pending ? 'your application review' : 'your outstanding document')
            openAgent([
              msg(
                'agent',
                pending
                  ? "You're in manual review — that's normal for limits at this level and it isn't a bad sign. I can tell you exactly what the analyst is checking, or ping you the moment it clears."
                  : "I can check whether the tenancy agreement in your Arta documents would satisfy this — you uploaded one in June, which is inside the 3-month window for a new one if you have it.",
              ),
            ])
          }}
          className="mt-3 w-full py-3 text-[14px] font-medium text-ink-muted"
        >
          Ask {t.agentName} about this →
        </button>
      </ActionBar>
    </div>
  )
}

/* --- The emotional peak --------------------------------------------------- */

function ApprovedScreen({ limit }: { limit: number }) {
  const { go, theme, kyc, cardFinish } = useApp()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 420)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <div className="flex flex-1 flex-col items-center px-6 pt-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="eyebrow text-ink-muted"
        >
          Approved
        </motion.p>

        {/* Card art — the finish chosen at Stage 1, revealed. */}
        <motion.div
          initial={{ rotateX: 62, rotateZ: -18, y: 40, opacity: 0, scale: 0.86 }}
          animate={revealed ? { rotateX: 0, rotateZ: 0, y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 62, damping: 15 }}
          style={{ perspective: 900 }}
          className="mt-7 w-full"
        >
          <CardArt theme={theme} finish={cardFinish} holder={kyc[0].value.toUpperCase()} last4="4429" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
          className="mt-8 w-full text-center"
        >
          <h1 className="hero-type text-[30px] text-ink">it's yours</h1>
          <p className="tabular mt-4 text-[40px] font-semibold leading-none text-ink">
            {money0(limit)}
          </p>
          <p className="mt-2 text-[14px] text-ink-muted">approved credit limit</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : {}}
          transition={{ delay: 0.55 }}
          className="mt-auto w-full space-y-3 pb-2"
        >
          <StatFooterBar label="Interest rate (EIR)" value={pa(cardTerms.eir)} />
          <StatFooterBar label="Cash back" value="2% on everything" />
        </motion.div>
      </div>

      <ActionBar>
        <PillButton full onClick={() => go('cardHome')} icon={<CheckCircle size={18} weight="fill" />}>
          Add to Apple Wallet
        </PillButton>
        <button onClick={() => go('cardHome')} className="mt-3 w-full py-3 text-[14px] font-medium text-ink-muted">
          Not now — go to my card
        </button>
      </ActionBar>
    </div>
  )
}
