import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, LockSimple } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { cardTerms, keyFacts } from '../lib/mockData'
import { pa } from '../lib/payoff'

/* --- 5. DisclosureCard ----------------------------------------------------
   "Plain as Day". Collapsed by default, persistent from the credit-limit step
   through Review & submit, and — critically — the Declaration step renders the
   SAME component over the SAME `keyFacts` array rather than a second copy of
   the legal text (user story 3, AC 3.3).                                    */

export function DisclosureCard({
  eyebrow = 'Key facts',
  headline,
  body,
  children,
  defaultOpen = false,
  onToggle,
}: {
  eyebrow?: string
  headline: string
  body?: string
  children: ReactNode
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-md border border-white/20 bg-white/[0.04]">
      <button
        onClick={() => {
          setOpen((o) => !o)
          onToggle?.(!open)
        }}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex-1">
          <p className="eyebrow text-ink-muted">{eyebrow}</p>
          <p className="mt-1.5 text-[15px] font-semibold text-ink">{headline}</p>
          {body && <p className="mt-1 text-[13px] leading-snug text-ink-muted">{body}</p>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="mt-1 text-ink-muted">
          <CaretDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-4 pb-4 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** The persistent "Highlights of charges" card, steps 5 → 9. */
export function KeyFactsCard({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <DisclosureCard
      eyebrow="Highlights of charges"
      headline={`EIR ${pa(cardTerms.eir)} · no annual fee · no FX fee`}
      body="The full rate and fee schedule, one tap away — on every step."
      defaultOpen={defaultOpen}
    >
      <ul className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
        {keyFacts.map((f) => (
          <li key={f.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-ink-muted">{f.label}</span>
              <span className="tabular text-[13px] font-semibold text-ink">{f.value}</span>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-ink-faint">{f.detail}</p>
          </li>
        ))}
      </ul>
    </DisclosureCard>
  )
}

/* --- "Ask With Care" — the sensitive-input reassurance module ---------------
   One component, several placements. Present on income and ID steps, always
   re-expandable after collapsing (user story 2, AC 2.3).                    */

export function ReassuranceModule({ what }: { what: string }) {
  return (
    <DisclosureCard
      eyebrow="Ask with care"
      headline={`Why we ask for ${what}`}
      body="Encrypted in transit and at rest. Tap to see exactly what we do — and don't do — with it."
    >
      <div className="space-y-3 text-[13px] leading-relaxed">
        <div>
          <p className="font-semibold text-ink">What we collect</p>
          <p className="text-ink-muted">
            Your employment status, annual income, and any other regular income you tell us about.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">What we use it for</p>
          <p className="text-ink-muted">
            Setting a credit limit you can comfortably carry, and meeting the affordability checks
            our issuing bank is required to make.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">What we never do</p>
          <p className="text-ink-muted">
            We don't sell it, we don't share it with advertisers, and we don't use it to price your
            investment products.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 text-positive">
          <LockSimple size={15} weight="fill" />
          <span className="text-[12px] font-medium">256-bit encryption · protected under Singapore's PDPA</span>
        </div>
      </div>
    </DisclosureCard>
  )
}
