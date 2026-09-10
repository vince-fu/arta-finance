import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowsLeftRight,
  CheckCircle,
  Plus,
  Snowflake,
  Sparkle,
  ListDashes,
  Receipt,
} from '@phosphor-icons/react'

import { useApp } from '../appState'
import { AgentBadge, msg, useAgent } from '../components/agent'
import {
  AllocationBar,
  Eyebrow,
  GradientCard,
  PillButton,
  StatFooterBar,
  Surface,
} from '../components/primitives'
import { ActionBar, ScrollArea, StatusBar, TabNavRow } from '../components/chrome'
import {
  cardTerms,
  lifecycle,
  limits,
  recentSpend,
  statement,
  THEMES,
} from '../lib/mockData'
import {
  cashAccount,
  cashName,
  interestOn,
  minimumDue,
  money,
  money0,
  recommend,
  scenario,
  type Scenario,
} from '../lib/payoff'

/* ==========================================================================
   12 · CARD HOME
   Deliberately built on the same pattern as reference screen 2: a huge
   tabular number, a mint delta line, the AllocationBar, frosted quick
   actions. The bar is the SAME component as the portfolio breakdown — only
   the semantics change (public/private/cash → used/available).
   ========================================================================== */

export function CardHomeScreen() {
  const { go, theme, lowCash, paymentScheduled } = useApp()
  const t = THEMES[theme]
  const { openAgent, setContext, messages } = useAgent()
  const used = statement.currentBalance
  const limit = limits.approved
  const available = limit - used
  const cash = lowCash ? 900 : cashAccount.balance

  const openAgentHere = () => {
    setContext('your card · statement posted')
    openAgent(
      messages.length === 0
        ? [
            msg(
              'agent',
              `Your ${t.cardName} is active with a ${money0(limit)} limit. Your statement posted on ${statement.closedOn} — want me to walk through how to pay it?`,
              { actions: [{ label: 'Yes, walk me through it', onClick: () => go('statement') }] },
            ),
          ]
        : undefined,
    )
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <div className="mb-1 mt-2 flex h-11 items-center gap-3 px-5">
        <div className="grid h-10 w-10 place-items-center rounded-pill bg-white/[0.08]">
          <span className="hero-type text-[21px] font-semibold text-ink">{t.mark}</span>
        </div>
        <p className="text-[14px] font-medium text-ink-muted">{t.cardName}</p>
        <div className="ml-auto">
          <AgentBadge onClick={openAgentHere} hasUnread={!paymentScheduled} />
        </div>
      </div>

      <ScrollArea className="pt-5">
        <Eyebrow>Current balance</Eyebrow>
        <p className="tabular mt-2 text-[40px] font-semibold leading-none text-ink">
          ${used.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="tabular mt-2 text-[15px] text-positive">
          {money0(available)} <span className="text-ink-muted">available to spend</span>
        </p>

        <div className="mt-7">
          <AllocationBar
            segments={[
              {
                label: 'Used',
                value: used,
                color: 'rgb(var(--accent-brand-alt))',
                caption: money0(used),
              },
              {
                label: 'Available',
                value: available,
                color: 'rgb(255 255 255 / 0.22)',
                caption: money0(available),
              },
            ]}
          />
        </div>

        <div className="mt-7 flex gap-2.5">
          {[
            { icon: <ArrowsLeftRight size={19} />, label: 'Pay' },
            { icon: <Plus size={19} />, label: 'Add' },
            { icon: <Snowflake size={19} />, label: 'Freeze' },
            { icon: <ListDashes size={19} />, label: 'Activity' },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => a.label === 'Pay' && go('statement')}
              className="frost flex flex-1 flex-col items-center gap-1.5 rounded-md py-3.5 text-white"
            >
              {a.icon}
              <span className="eyebrow text-[10px]">{a.label}</span>
            </button>
          ))}
        </div>

        {/* --- Proactive Smart Payoff insight (Flow 2's entry into the deep
            moment). Proactive but dismissible; always carries an action. --- */}
        {paymentScheduled === null ? (
          <ProactiveInsight cash={cash} onOpen={() => go('statement')} agentName={t.agentName} />
        ) : (
          <Surface className="mt-6 border-positive/25 bg-positive/[0.06]">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} weight="fill" className="mt-[1px] shrink-0 text-positive" />
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  {money(paymentScheduled)} scheduled for {statement.dueDate}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  Paying from {cashName()}. I'll remind you two days before it goes out.
                </p>
              </div>
            </div>
          </Surface>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <GradientCard
            gradient="assetA"
            title="Cash back earned"
            amount={money(statement.rewardsEarned)}
            icon={<Sparkle size={22} />}
            className="min-h-[168px]"
          />
          <GradientCard
            gradient="assetC"
            title="This statement"
            amount={money(statement.balance)}
            icon={<Receipt size={22} />}
            className="min-h-[168px]"
            onClick={() => go('statement')}
          />
        </div>

        <Eyebrow className="mb-3 mt-7">Recent</Eyebrow>
        <div className="divide-y divide-white/[0.06] overflow-hidden rounded-md border border-white/[0.08] bg-card">
          {recentSpend.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">{s.merchant}</p>
                <p className="text-[12px] text-ink-faint">
                  {s.category} · {s.date}
                </p>
              </div>
              <p className="tabular text-[14px] font-semibold text-ink">{money(s.amount)}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => go('lifecycle')}
          className="mt-6 flex w-full items-center justify-between rounded-md border border-white/[0.08] bg-card p-4 text-left"
        >
          <div>
            <p className="text-[14px] font-medium text-ink">Where {t.agentName} shows up</p>
            <p className="text-[12px] text-ink-faint">The full lifecycle map</p>
          </div>
          <ArrowRight size={18} className="text-ink-muted" />
        </button>
      </ScrollArea>

      <TabNavRow active="card" />
    </div>
  )
}

function ProactiveInsight({
  cash,
  onOpen,
  agentName,
}: {
  cash: number
  onOpen: () => void
  agentName: string
}) {
  const [dismissed, setDismissed] = useState(false)
  const rec = useMemo(() => recommend(cash), [cash])
  if (dismissed) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <div className="rounded-md border border-white/15 bg-white/[0.05] p-4">
        <div className="flex items-center gap-2 text-ink-muted">
          <Sparkle size={14} weight="fill" />
          <span className="eyebrow">{agentName}</span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-auto text-[12px] font-medium text-ink-faint"
          >
            Dismiss
          </button>
        </div>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink">
          Your statement of{' '}
          <span className="tabular font-semibold">{money(statement.balance)}</span> is due in{' '}
          {statement.daysUntilDue} days. {rec.headline.replace(/^Pay /, "I'd pay ")} — here's the
          arithmetic.
        </p>
        <div className="mt-3">
          <PillButton size="sm" onClick={onOpen}>
            Show me
          </PillButton>
        </div>
      </div>
    </motion.div>
  )
}

/* ==========================================================================
   14 · SMART PAYOFF — the deep moment
   ========================================================================== */

type Choice = { id: string; label: string; amount: number }

export function StatementScreen() {
  const { back, theme, lowCash, setPaymentScheduled, paymentScheduled } = useApp()
  const t = THEMES[theme]
  const { openAgent, setContext, push } = useAgent()

  const cash = lowCash ? 900 : cashAccount.balance
  const rec = useMemo(() => recommend(cash), [cash])

  const choices: Choice[] = useMemo(
    () => [
      { id: 'full', label: 'Pay in full', amount: statement.balance },
      { id: 'half', label: 'Pay half', amount: statement.balance / 2 },
      { id: 'min', label: 'Minimum only', amount: minimumDue },
    ],
    [],
  )

  const [selected, setSelected] = useState<number>(rec.scenario.payment)
  const sc = scenario(selected, cash)
  // Interest avoided by the recommended payment — measured on the amount
  // actually paid, so a cash-constrained recommendation doesn't overstate it.
  const interestAvoided = interestOn(rec.scenario.payment)

  // If the recommendation moves (e.g. the cash balance changes), follow it.
  useEffect(() => setSelected(rec.scenario.payment), [rec.scenario.payment])

  if (paymentScheduled !== null) return <PaymentConfirmed amount={paymentScheduled} onDone={back} />

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <div className="mb-2 mt-2 flex h-11 items-center gap-3 px-5">
        <button onClick={back} className="-ml-2 p-2 text-ink">
          ←
        </button>
        <p className="text-[14px] font-medium text-ink-muted">Statement</p>
        <div className="ml-auto">
          <AgentBadge
            onClick={() => {
              setContext('your statement · smart payoff')
              openAgent([msg('agent', rec.reasoning)])
            }}
          />
        </div>
      </div>

      <ScrollArea className="pt-3">
        {/* 1 · Insight card */}
        <Eyebrow>Statement balance</Eyebrow>
        <p className="tabular mt-2 text-[40px] font-semibold leading-none text-ink">
          {money(statement.balance)}
        </p>
        <p className="mt-2 text-[15px] text-ink-muted">
          due {statement.dueDate} · in {statement.daysUntilDue} days
        </p>

        {/* 2 · Advisor reasoning, in real dollars */}
        <div className="mt-6 rounded-md border border-white/15 bg-white/[0.05] p-4">
          <div className="flex items-center gap-2 text-ink-muted">
            <Sparkle size={14} weight="fill" />
            <span className="eyebrow">{t.agentName} · recommended</span>
          </div>
          <p className="mt-2.5 text-[17px] font-semibold leading-snug text-ink">{rec.headline}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{rec.reasoning}</p>

          <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
            <ReasonRow
              label="Interest avoided"
              value={`+${money(interestAvoided)}`}
              tone="positive"
            />
            <ReasonRow
              label={`Yield given up (${(cashAccount.yieldApy * 100).toFixed(1)}% on ${cashName()})`}
              value={`−${money(rec.scenario.forgone)}`}
            />
            <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5">
              <span className="text-[13px] font-semibold text-ink">Net, this cycle</span>
              <span className="tabular text-[16px] font-bold text-positive">
                +{money(interestAvoided - rec.scenario.forgone)}
              </span>
            </div>
          </div>

          {rec.constrainedBy && (
            <p className="mt-3 rounded-xs bg-warning/10 px-3 py-2 text-[12px] leading-relaxed text-warning">
              Adjusted for your {cashName()} balance of {money(cash)} — I won't recommend a
              payment you can't make.
            </p>
          )}
        </div>

        {/* 3 · Guided actions */}
        <Eyebrow className="mb-3 mt-7">Or choose another amount</Eyebrow>
        <div className="flex gap-2">
          {choices.map((c) => {
            const on = Math.abs(selected - c.amount) < 0.01
            const affordable = c.amount <= cash
            return (
              <button
                key={c.id}
                disabled={!affordable}
                onClick={() => setSelected(c.amount)}
                className={`flex-1 rounded-md border px-2 py-3 text-center transition-colors disabled:opacity-35 ${
                  on ? 'border-white/45 bg-white/[0.1]' : 'border-white/[0.1] bg-card'
                }`}
              >
                <p className="text-[13px] font-semibold text-ink">{c.label}</p>
                <p className="tabular mt-0.5 text-[12px] text-ink-muted">{money0(c.amount)}</p>
              </button>
            )
          })}
        </div>

        {/* 4 · Live recompute for whatever is selected */}
        <ScenarioBreakdown sc={sc} />

        {/* 5 · Follow-up conversation — the same questions are answerable as
            free text in the chat surface; these are just the shortcuts. */}
        <Eyebrow className="mb-3 mt-7">Ask about this</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {[
            'What if I pay half now?',
            'What if I pay nothing?',
            'Why not keep the cash invested?',
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                setContext('your statement · smart payoff')
                openAgent()
                push([msg('user', q), msg('agent', answerFollowUp(q, cash))])
              }}
              className="rounded-pill border border-white/20 bg-white/[0.04] px-3.5 py-2 text-[13px] text-ink-muted"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mt-7 space-y-3">
          <StatFooterBar label="APR" value={`${(cardTerms.apr * 100).toFixed(2)}%`} />
          <StatFooterBar label={`${cashName()} yield`} value={`${(cashAccount.yieldApy * 100).toFixed(1)}% APY`} />
          <StatFooterBar label={cashName()} value={money(cash)} />
        </div>
      </ScrollArea>

      <ActionBar>
        <PillButton
          full
          disabled={selected > cash}
          onClick={() => setPaymentScheduled(selected)}
        >
          Pay {money(selected)} from {cashName()}
        </PillButton>
      </ActionBar>
    </div>
  )
}

function ReasonRow({ label, value, tone }: { label: string; value: string; tone?: 'positive' }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[13px] leading-snug text-ink-muted">{label}</span>
      <span className={`tabular shrink-0 text-[14px] font-semibold ${tone === 'positive' ? 'text-positive' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  )
}

/** The live arithmetic panel — every value recomputed from `scenario()`. */
export function ScenarioBreakdown({ sc }: { sc: Scenario }) {
  return (
    <motion.div layout className="mt-4 rounded-md border border-white/[0.08] bg-card p-4">
      <div className="space-y-2.5">
        <ReasonRow label="You pay now" value={money(sc.payment)} />
        <ReasonRow label="Balance carried" value={money(sc.carried)} />
        <ReasonRow
          label={`Interest next cycle (${(cardTerms.apr * 100).toFixed(2)}% APR)`}
          value={sc.interest > 0 ? `−${money(sc.interest)}` : money(0)}
        />
        <ReasonRow label="Yield given up" value={sc.forgone > 0 ? `−${money(sc.forgone)}` : money(0)} />
        <div className="flex items-baseline justify-between border-t border-white/10 pt-2.5">
          <span className="text-[13px] font-semibold text-ink">Cost of this choice</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={sc.totalCost.toFixed(2)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="tabular text-[16px] font-bold text-ink"
            >
              {money(sc.totalCost)}
            </motion.span>
          </AnimatePresence>
        </div>
        {sc.vsMinimum > 0.005 && (
          <p className="text-[12px] text-positive">
            {money(sc.vsMinimum)} better than paying the minimum.
          </p>
        )}
      </div>
    </motion.div>
  )
}

function PaymentConfirmed({ amount, onDone }: { amount: number; onDone: () => void }) {
  const { setPaymentScheduled } = useApp()
  const sc = scenario(amount)
  const nextStatementStart = sc.carried + sc.interest

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <ScrollArea className="pt-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="mb-7 grid h-14 w-14 place-items-center rounded-pill bg-positive/15"
        >
          <CheckCircle size={28} weight="fill" className="text-positive" />
        </motion.div>
        <h1 className="hero-type text-[30px] text-ink">that's handled</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {money(amount)} will move from {cashName()} on {statement.dueDate}. Nothing else is
          needed from you.
        </p>

        <Surface className="mt-6">
          <Eyebrow>Next statement, as it stands</Eyebrow>
          <p className="tabular mt-2 text-[26px] font-semibold text-ink">
            {money(nextStatementStart)}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
            {sc.carried > 0
              ? `${money(sc.carried)} carried plus about ${money(sc.interest)} of interest.`
              : 'Nothing carried forward, so no interest at all.'}
          </p>
        </Surface>

        <Surface className="mt-3">
          <Eyebrow>I'll remind you</Eyebrow>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
            Two days before the due date, referencing this exact recommendation — not a generic
            payment notice.
          </p>
        </Surface>
      </ScrollArea>
      <ActionBar>
        <PillButton full onClick={onDone}>
          Back to my card
        </PillButton>
        <button
          onClick={() => setPaymentScheduled(null)}
          className="mt-3 w-full py-3 text-[14px] font-medium text-ink-muted"
        >
          Change this payment
        </button>
      </ActionBar>
    </div>
  )
}

/* --- Follow-up answering --------------------------------------------------
   Parses the member's question into a payment amount, then answers from the
   same `scenario()` used everywhere else. Nothing here is a canned string
   with numbers baked in — change the mock balance and every answer moves. */

export function answerFollowUp(question: string, cash = cashAccount.balance): string {
  const q = question.toLowerCase()
  let amount: number | null = null

  const dollars = q.match(/\$?\s?([\d,]+(?:\.\d+)?)\s?(k)?/)
  if (/half/.test(q)) amount = statement.balance / 2
  else if (/nothing|skip|don'?t pay|zero/.test(q)) amount = 0
  else if (/minimum|min\b/.test(q)) amount = minimumDue
  else if (/full|everything|all of it/.test(q)) amount = statement.balance
  else if (/third/.test(q)) amount = statement.balance / 3
  else if (dollars) {
    const n = Number(dollars[1].replace(/,/g, ''))
    if (!Number.isNaN(n) && n > 0) amount = dollars[2] ? n * 1000 : n
  }

  if (/invest|yield|keep the cash|why not/.test(q) && amount === null) {
    return (
      `Because the card charges ${(cardTerms.apr * 100).toFixed(2)}% and your ${cashName()} pays ` +
      `${(cashAccount.yieldApy * 100).toFixed(1)}%. Every dollar left on the card costs about ` +
      `${(cardTerms.apr * 100 - cashAccount.yieldApy * 100).toFixed(1)}c a year more than it earns. ` +
      `Keeping cash invested only wins when the yield beats the APR — it doesn't here, and it very rarely does on a credit card.`
    )
  }

  if (amount === null) {
    // AC 5.3 — say so plainly and offer a handoff rather than inventing an answer.
    return (
      "I can't work that one out from what I can see. I don't want to guess at something that " +
      'affects your money — a specialist on the card team can pick this up in chat, usually within ' +
      'a couple of minutes. Want me to hand it over?'
    )
  }

  const sc = scenario(amount, cash)
  const full = scenario(statement.balance, cash)

  if (!sc.affordable) {
    return (
      `That's more than the ${money(cash)} in your ${cashName()}, so I can't set it up from ` +
      `there. The largest I could pay today is ${money(cash)} — that would leave ` +
      `${money(statement.balance - cash)} revolving, at about ${money(interestOn(statement.balance - cash))} of interest.`
    )
  }

  if (amount === 0) {
    return (
      `Paying nothing isn't an option — the ${money(minimumDue)} minimum is due on ${statement.dueDate}, ` +
      `and missing it costs a ${money(cardTerms.lateFee)} late fee on top of about ` +
      `${money(interestOn(statement.balance))} of interest. It would also mark your credit file.`
    )
  }

  return (
    `Paying ${money(amount)} leaves ${money(sc.carried)} on the card. That accrues about ` +
    `${money(sc.interest)} of interest over the next cycle, and the ${money(amount)} you move out of ` +
    `${cashName()} gives up ${money(sc.forgone)} of yield — ${money(sc.totalCost)} in total. ` +
    `Paying in full costs ${money(full.totalCost)}, so this option is ` +
    `${money(sc.totalCost - full.totalCost)} more expensive.`
  )
}

/* ==========================================================================
   13 · LIFECYCLE MAP — the wide, shallow half of Flow 2
   ========================================================================== */

export function LifecycleScreen() {
  const { back, theme, go } = useApp()
  const t = THEMES[theme]
  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <div className="mb-2 mt-2 flex h-11 items-center gap-3 px-5">
        <button onClick={back} className="-ml-2 p-2 text-ink">
          ←
        </button>
        <p className="text-[14px] font-medium text-ink-muted">Lifecycle</p>
      </div>
      <ScrollArea className="pt-4">
        <h1 className="hero-type text-[30px] text-ink">
          one companion,
          <br />
          not five features
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {t.agentName} is the same identity, the same surface and the same thread at every stage of
          the card. Only the context changes.
        </p>

        <div className="relative mt-8 pl-6">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/12" />
          {lifecycle.map((s) => (
            <div key={s.stage} className="relative pb-7 last:pb-0">
              <span
                className={`absolute -left-6 top-1 h-[15px] w-[15px] rounded-pill border-2 ${
                  s.built ? 'border-transparent bg-positive' : 'border-white/25 bg-bg'
                }`}
              />
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-ink">{s.stage}</p>
                {s.built && (
                  <span className="rounded-pill bg-positive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-positive">
                    Built here
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{s.detail}</p>
            </div>
          ))}
        </div>

        <Surface className="mt-4">
          <Eyebrow>The depth bet</Eyebrow>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Two of the five stages are designed in full — pre-qualification in the application, and
            Smart Payoff at the statement. Every card could ship spend categorisation. Only a wealth
            platform can compare your APR against your own yield.
          </p>
        </Surface>

        <div className="mt-5">
          <PillButton full onClick={() => go('statement')}>
            Open the deep moment
          </PillButton>
        </div>
      </ScrollArea>
      <TabNavRow active="card" />
    </div>
  )
}
