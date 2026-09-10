import { ArrowLeft, CreditCard, House, ChartPieSlice, DotsThree } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/* --- Device chrome --------------------------------------------------------
   The prototype is presented inside a fixed 390×844 viewport so it demos
   cleanly in a browser during a live walkthrough — not a responsive site. */

export const VIEWPORT = { w: 390, h: 844 }

export function StatusBar({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const c = tone === 'light' ? 'text-white' : 'text-black'
  return (
    <div className={`flex h-11 shrink-0 items-center justify-between px-6 text-[14px] font-semibold ${c}`}>
      <span className="tabular">10:00</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <path d="M0 11h4V6H0v5Zm6.5 0h4V3h-4v8ZM13 0v11h4V0h-4Z" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <path d="M7.5 10.5 0 3.2A10.6 10.6 0 0 1 15 3.2L7.5 10.5Z" />
        </svg>
        <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor">
          <rect width="9" height="13" rx="2" />
        </svg>
      </div>
    </div>
  )
}

/* --- Progress stepper (a lending primitive Arta's system doesn't have) ---- */

export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          animate={{ opacity: i < step ? 1 : 0.22 }}
          className="h-[3px] flex-1 rounded-pill bg-white"
        />
      ))}
    </div>
  )
}

/* --- Screen header -------------------------------------------------------- */

export function ScreenHeader({
  onBack,
  right,
  step,
  totalSteps,
  title,
}: {
  onBack?: () => void
  right?: ReactNode
  step?: number
  totalSteps?: number
  title?: string
}) {
  return (
    <div className="shrink-0">
      {/* Same top rhythm as the entry screen: status bar, 8px, a 44px icon row. */}
      <StatusBar />
      <div className="px-5 pb-3 pt-2">
        <div className="mb-3 flex h-11 items-center gap-3">
          {onBack ? (
            <button onClick={onBack} aria-label="Back" className="-ml-2 p-2 text-white">
              <ArrowLeft size={22} />
            </button>
          ) : (
            <span className="w-1" />
          )}
          {title && <p className="flex-1 text-[14px] font-medium text-ink-muted">{title}</p>}
          <div className="ml-auto">{right}</div>
        </div>
        {step !== undefined && totalSteps !== undefined && <Stepper step={step} total={totalSteps} />}
      </div>
    </div>
  )
}

/* --- 7. TabNavRow --------------------------------------------------------- */

const TABS = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'card', label: 'Card', Icon: CreditCard },
  { id: 'invest', label: 'Invest', Icon: ChartPieSlice },
  { id: 'more', label: 'More', Icon: DotsThree },
] as const

export function TabNavRow({
  active = 'card',
  onSelect,
}: {
  active?: string
  onSelect?: (id: string) => void
}) {
  return (
    <div className="flex shrink-0 items-start justify-around border-t border-white/[0.08] bg-bg px-2 pb-6 pt-3">
      {TABS.map(({ id, label, Icon }) => {
        const on = id === active
        return (
          <button
            key={id}
            onClick={() => onSelect?.(id)}
            className="flex w-16 flex-col items-center gap-1.5"
          >
            <Icon size={22} weight={on ? 'fill' : 'regular'} className={on ? 'text-ink' : 'text-ink-faint'} />
            <span className={`eyebrow text-[10px] ${on ? 'text-ink' : 'text-ink-faint'}`}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* --- Form field system ----------------------------------------------------
   Dense-form primitives, the gap PRD §11.1 calls out in Arta's current,
   whitespace-heavy, investing-only design system.                          */

export function Field({
  label,
  value,
  onChange,
  prefix,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  placeholder?: string
  type?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="eyebrow text-ink-muted">{label}</span>
      <div className="mt-2 flex items-center rounded-sm border border-white/15 bg-white/[0.05] px-4 focus-within:border-white/35">
        {prefix && <span className="tabular mr-1 text-[16px] text-ink-muted">{prefix}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="tabular h-[50px] w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint"
        />
      </div>
      {hint && <span className="mt-1.5 block text-[12px] text-ink-faint">{hint}</span>}
    </label>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={`h-[30px] w-[52px] shrink-0 rounded-pill p-[3px] transition-colors ${
        on ? 'bg-positive' : 'bg-white/15'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`block h-6 w-6 rounded-pill bg-white ${on ? 'ml-[22px]' : 'ml-0'}`}
      />
    </button>
  )
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-start gap-3 text-left">
      <span
        className={`mt-[2px] grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors ${
          checked ? 'border-transparent bg-white' : 'border-white/30'
        }`}
      >
        {checked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4.4 4.4 8 11 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[13px] leading-snug text-ink-muted">{children}</span>
    </button>
  )
}

/** Sticky bottom action bar — one primary decision per screen. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-white/[0.08] bg-bg px-5 pb-7 pt-4">{children}</div>
  )
}

export function ScrollArea({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`no-scrollbar flex-1 overflow-y-auto px-5 pb-6 ${className}`}>{children}</div>
  )
}
