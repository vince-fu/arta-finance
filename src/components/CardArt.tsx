import { useId } from 'react'
import { THEMES, type Theme } from '../lib/mockData'

/* ============================================================================
   CardArt — the physical card, as revealed on approval.

   A black, glossy metal-style base carrying two things taken from Arta's own
   brand (artafinance.com):
     · the "arta" wordmark, filled with the iridescent tone of the Arta mark
     · the broken concentric rings from the "AI for Wealth" pattern

   Every colour in the rings and the logo fill resolves through --ring-1…7, so
   the partner theme re-tones the whole card without touching this file.
   ========================================================================== */

/** The Arta wordmark, from artafinance.com. viewBox 0 0 398 148. */
const ARTA_WORDMARK: { d: string; evenOdd?: boolean }[] = [
  {
    evenOdd: true,
    d: 'M324 112c0 9.065 6.945 16 18 16 18.129 0 35.082-15.803 35.082-31.5v-6.91L342 97c-13.487 2.653-18 6.377-18 15m26-83c27.857 0 48 17.47 48 44v70a2 2 0 0 1-2 2h-17a2 2 0 0 1-2-2v-14c-7.125 10.256-17.217 18-38 18s-36-15.428-36-34c0-17.466 10.395-28.357 36-33l37-7v-1c0-14.592-11.639-23-28-23-8.841 0-18.184 2.264-25.599 7.049-.821.53-1.907.444-2.599-.247l-10.338-10.338c-.8-.8-.779-2.108.079-2.846C320.269 33.388 334.259 29 350 29M273 52h-56V2a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v31h33a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2m-21 93c-22 0-35-12-35-38V52h4l17.713 13.6A3.01 3.01 0 0 1 240 68.070V105c0 14 5 19 17 19h20a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2z',
  },
  {
    d: 'M151 34a2 2 0 0 0-2-2h-19a2 2 0 0 0-2 2v109a2 2 0 0 0 2 2h19a2 2 0 0 0 2-2V95c0-25 15-43 31-43h5a2 2 0 0 0 2-2V34a2 2 0 0 0-2-2h-5c-11 0-26 6-31 18z',
  },
  {
    evenOdd: true,
    d: 'M21 112c0 9.065 6.945 16 18 16 18.13 0 35.082-15.803 35.082-31.5v-6.91L39 97c-13.486 2.653-18 6.377-18 15m26-83c27.858 0 48 17.47 48 44v70a2 2 0 0 1-2 2H76a2 2 0 0 1-2-2v-14c-7.125 10.256-17.217 18-38 18-20.782 0-36-15.428-36-34 0-17.466 10.395-28.357 36-33l37-7v-1c0-14.592-11.64-23-28-23-8.84 0-18.184 2.264-25.599 7.049-.821.53-1.907.444-2.599-.247L6.464 45.464c-.8-.8-.78-2.108.079-2.846C17.269 33.388 31.259 29 47 29',
  },
]

/**
 * Broken concentric rings. Each dash pattern sums to 100 against
 * pathLength=100, so every ring is a full circle split into arcs, rotated to
 * stagger the breaks — the same rhythm as the site's ring animation.
 */
const RINGS = [
  { r: 34, dash: '30 10 42 18', rot: 20, w: 1.4, grad: 0 },
  { r: 52, dash: '55 8 20 17', rot: 140, w: 1.6, grad: 1 },
  { r: 70, dash: '18 6 46 12 12 6', rot: 260, w: 1.5, grad: 2 },
  { r: 88, dash: '62 14 16 8', rot: 60, w: 1.8, grad: 0 },
  { r: 106, dash: '26 9 38 7 12 8', rot: 190, w: 1.5, grad: 1 },
  { r: 124, dash: '48 16 22 14', rot: 310, w: 1.7, grad: 2 },
  { r: 142, dash: '14 8 52 10 10 6', rot: 100, w: 1.4, grad: 0 },
  { r: 160, dash: '40 20 30 10', rot: 230, w: 1.6, grad: 1 },
  { r: 178, dash: '22 12 44 22', rot: 350, w: 1.3, grad: 2 },
]

const CX = 312
const CY = 104

/** Stop sets for the three ring gradients — together they walk the full hue loop. */
const RING_STOPS = [
  ['--ring-1', '--ring-2', '--ring-3'],
  ['--ring-3', '--ring-4', '--ring-5'],
  ['--ring-6', '--ring-7', '--ring-2'],
]

export function CardArt({
  theme,
  holder,
  last4,
}: {
  theme: Theme
  holder: string
  last4: string
}) {
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `${uid}-${name}`
  const t = THEMES[theme]

  const rings = (filter?: string) => (
    <g mask={`url(#${id('fadeBottom')})`}>
    <g filter={filter} mask={`url(#${id('fade')})`}>
      {RINGS.map((ring) => (
        <circle
          key={ring.r}
          cx={CX}
          cy={CY}
          r={ring.r}
          fill="none"
          stroke={`url(#${id(`ring${ring.grad}`)})`}
          strokeWidth={ring.w}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={ring.dash}
          transform={`rotate(${ring.rot} ${CX} ${CY})`}
        />
      ))}
    </g>
    </g>
  )

  return (
    <div
      style={{
        backgroundImage: 'var(--card-metal)',
        boxShadow:
          'inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 0 0 1px rgb(255 255 255 / 0.08), 0 24px 56px -14px rgb(0 0 0 / 0.8)',
      }}
      className="card-sheen grain relative aspect-[1.586/1] w-full overflow-hidden rounded-md"
    >
      {/* Ring pattern — a soft glow pass under a crisp pass. */}
      <svg
        viewBox="0 0 400 252"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          {RING_STOPS.map((stops, i) => (
            <linearGradient
              key={i}
              id={id(`ring${i}`)}
              gradientUnits="userSpaceOnUse"
              x1={[120, 480, 300][i]}
              y1={[-30, 0, 330][i]}
              x2={[480, 120, 300][i]}
              y2={[330, 300, -30][i]}
            >
              {stops.map((v, j) => (
                <stop key={v} offset={`${(j / (stops.length - 1)) * 100}%`} style={{ stopColor: `var(${v})` }} />
              ))}
            </linearGradient>
          ))}
          {/* Fade the rings out toward the left so the logo and number sit on clean black. */}
          <linearGradient id={id('fadeGrad')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.18" stopColor="#000" />
            <stop offset="0.62" stopColor="#fff" />
          </linearGradient>
          <mask id={id('fade')} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="252">
            <rect width="400" height="252" fill={`url(#${id('fadeGrad')})`} />
          </mask>
          {/* …and toward the bottom, so the card number and name stay legible. */}
          <linearGradient id={id('fadeBottomGrad')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="0.86" stopColor="#000" />
          </linearGradient>
          <mask id={id('fadeBottom')} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="252">
            <rect width="400" height="252" fill={`url(#${id('fadeBottomGrad')})`} />
          </mask>
          <filter id={id('glow')} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g opacity="0.45">{rings(`url(#${id('glow')})`)}</g>
        <g opacity="0.9">{rings()}</g>
      </svg>

      {/* Gloss — the lacquer highlight that makes it read as shiny, not matte. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--card-gloss)' }}
      />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start">
          <Wordmark theme={theme} gradientId={id('logo')} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Chip />
          <Contactless />
        </div>

        <div className="mt-auto">
          <p className="tabular text-[15px] tracking-[0.2em] text-white/90">•••• •••• •••• {last4}</p>
          <div className="mt-1.5 flex items-end justify-between">
            <p className="text-[11px] font-medium tracking-[0.12em] text-white/70">{holder}</p>
            <p className="text-[10px] font-medium tracking-[0.12em] text-white/50">{t.cardName.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --- Logo ----------------------------------------------------------------- */

function Wordmark({ theme, gradientId }: { theme: Theme; gradientId: string }) {
  const fill = (
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" style={{ stopColor: 'var(--ring-2)' }} />
        <stop offset="35%" style={{ stopColor: 'var(--ring-3)' }} />
        <stop offset="68%" style={{ stopColor: 'var(--ring-4)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--ring-6)' }} />
      </linearGradient>
    </defs>
  )

  // A partner's client never sees Arta branding (user story 8b, AC 8b.1).
  if (theme !== 'arta') {
    return (
      <svg height="24" viewBox="0 0 150 34" aria-label={THEMES[theme].brandName}>
        {fill}
        <text
          x="0"
          y="26"
          fill={`url(#${gradientId})`}
          style={{ font: '600 30px Quicksand, ui-rounded, sans-serif', letterSpacing: '-0.02em' }}
        >
          {THEMES[theme].brandName.split(' ')[0].toLowerCase()}
        </text>
      </svg>
    )
  }

  return (
    <svg height="24" viewBox="0 0 398 148" aria-label="Arta">
      {fill}
      {ARTA_WORDMARK.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={`url(#${gradientId})`}
          fillRule={p.evenOdd ? 'evenodd' : undefined}
          clipRule={p.evenOdd ? 'evenodd' : undefined}
        />
      ))}
    </svg>
  )
}

/* --- Card furniture ------------------------------------------------------- */

function Chip() {
  return (
    <svg width="38" height="28" viewBox="0 0 38 28" aria-hidden="true">
      <defs>
        <linearGradient id="chip-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4E4E7" />
          <stop offset="48%" stopColor="#9A9AA0" />
          <stop offset="100%" stopColor="#D1D1D6" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="37" height="27" rx="5.5" fill="url(#chip-metal)" stroke="rgb(0 0 0 / 0.25)" />
      <path
        d="M13 0.5v27M25 0.5v27M0.5 10h12.5M25 10h12.5M0.5 18h12.5M25 18h12.5M13 14h12"
        stroke="rgb(0 0 0 / 0.28)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

function Contactless() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
      {[3, 8, 13].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${4 + i * -1.5} q ${3.5 + i * 1.2} ${7 + i * 1.5} 0 ${14 + i * 3}`}
          stroke="rgb(255 255 255 / 0.6)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
