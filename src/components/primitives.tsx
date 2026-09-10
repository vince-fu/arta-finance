import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/* ============================================================================
   CORE DESIGN SYSTEM — 1. PillButton  2. GradientCard  3. GrainOverlay
   4. AllocationBar  5. DisclosureCard  6. StatFooterBar  7. TabNavRow
   8. AIMessageBubble / ChatSurface  (8 lives in agent.tsx)

   Rule for every component in this file: no hardcoded hex, no hardcoded font
   stack. Colours resolve through Tailwind to the semantic CSS variables in
   styles/tokens.css. That binding is what makes the partner theme a swap.
   ========================================================================== */

/* --- 3. GrainOverlay ------------------------------------------------------
   Not a visual component so much as a contract: any gradient surface in this
   prototype composes `gradientSurface()`, which always carries the grain. */
export function gradientSurface(gradientVar: string) {
  return { backgroundImage: `var(${gradientVar})` }
}

export const GRADIENTS = {
  hero: '--gradient-hero',
  assetA: '--gradient-asset-a',
  assetB: '--gradient-asset-b',
  assetC: '--gradient-asset-c',
  assetD: '--gradient-asset-d',
  calm: '--gradient-calm',
  premium: '--gradient-premium',
} as const

export type GradientName = keyof typeof GRADIENTS

/* --- 1. PillButton -------------------------------------------------------- */

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'md' | 'sm'
  icon?: ReactNode
  full?: boolean
}

export function PillButton({
  variant = 'primary',
  size = 'md',
  icon,
  full,
  className = '',
  children,
  disabled,
  ...rest
}: PillProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-pill font-semibold ' +
    'transition-[transform,opacity,background-color] active:scale-[0.98] disabled:opacity-40 ' +
    'disabled:active:scale-100 select-none'
  const sizes = size === 'sm' ? 'h-9 px-4 text-[13px]' : 'h-[52px] px-6 text-[15px]'
  const variants = {
    primary: 'bg-white text-black',
    secondary: 'frost text-white',
    outline: 'border border-white/25 text-white bg-transparent',
    ghost: 'text-ink-muted bg-transparent',
  }[variant]

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`${base} ${sizes} ${variants} ${full ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

/* --- 2. GradientCard ------------------------------------------------------ */

export function GradientCard({
  gradient = 'assetA',
  title,
  amount,
  icon,
  className = '',
  children,
  onClick,
}: {
  gradient?: GradientName
  title?: string
  amount?: string
  icon?: ReactNode
  className?: string
  children?: ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={gradientSurface(GRADIENTS[gradient])}
      className={`grain relative overflow-hidden rounded-lg p-5 text-white shadow-card ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="relative z-10 flex h-full flex-col">
        {title && <p className="text-[22px] font-bold leading-[1.15]">{title}</p>}
        {amount && <p className="tabular mt-3 text-[17px] font-semibold tracking-[0.08em]">{amount}</p>}
        {children}
        {icon && <div className="mt-auto pt-6 opacity-90">{icon}</div>}
      </div>
    </div>
  )
}

/** Full-bleed gradient panel — hero screens and the approval reveal. */
export function GradientPanel({
  gradient = 'hero',
  className = '',
  children,
}: {
  gradient?: GradientName
  className?: string
  children: ReactNode
}) {
  return (
    <div
      style={gradientSurface(GRADIENTS[gradient])}
      className={`grain relative overflow-hidden ${className}`}
    >
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  )
}

/* --- 4. AllocationBar -----------------------------------------------------
   The portfolio breakdown bar from screen 2, reused verbatim as the credit
   limit utilisation meter on Card Home. Same component, new semantics. */

export interface Segment {
  label: string
  value: number
  /** Any CSS colour expression — always passed from a semantic token. */
  color: string
  caption?: string
}

export function AllocationBar({
  segments,
  total,
  showLegend = true,
  height = 6,
}: {
  segments: Segment[]
  total?: number
  showLegend?: boolean
  height?: number
}) {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0)
  return (
    <div>
      <div className="flex items-center gap-[3px]" style={{ height }}>
        {segments.map((s) => (
          <motion.div
            key={s.label}
            initial={{ flexGrow: 0 }}
            animate={{ flexGrow: Math.max(s.value / sum, 0.012) }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="h-full rounded-pill"
            style={{ background: s.color, flexBasis: 0 }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="mt-4 flex justify-between">
          {segments.map((s) => (
            <div key={s.label}>
              <p className="tabular text-[19px] font-bold text-ink">{s.caption}</p>
              <p className="eyebrow mt-1 text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* --- 6. StatFooterBar ----------------------------------------------------- */

export function StatFooterBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end justify-between border-t border-white/10 pt-4">
      <p className="eyebrow text-ink-muted">{label}</p>
      <p className="tabular text-[19px] font-semibold text-ink">{value}</p>
    </div>
  )
}

/* --- Small shared building blocks ----------------------------------------- */

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow text-ink-muted ${className}`}>{children}</p>
}

export function ScreenTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="hero-type text-[30px] text-ink">{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-snug text-ink-muted">{sub}</p>}
    </div>
  )
}

export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-white/[0.08] bg-card p-4 ${className}`}>{children}</div>
  )
}
