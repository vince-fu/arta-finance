import { CheckCircle, Lock, PencilSimple, Sparkle } from '@phosphor-icons/react'
import { useApp } from '../appState'
import { CardArt } from '../components/CardArt'
import { ScrollArea, StatusBar, TabNavRow } from '../components/chrome'
import { AllocationBar, Eyebrow, PillButton, Surface } from '../components/primitives'
import { THEMES, cardTerms, limits, statement, type Theme } from '../lib/mockData'
import { money, money0, pa } from '../lib/payoff'

/* ==========================================================================
   BRAND-IN-A-BOX — Challenge B proof

   The two panels below are the SAME components rendered twice. The only
   difference between them is `data-theme`, which re-binds the semantic
   variables in tokens.css. No layout, no copy, and no compliance content is
   duplicated or overridden — which is exactly the fixed/configurable line.
   ========================================================================== */

export function BrandInABoxScreen() {
  const { back, theme, setTheme, cardFinish } = useApp()

  return (
    <div className="flex h-full flex-col bg-bg">
      <StatusBar />
      <div className="mb-2 mt-2 flex h-11 items-center gap-3 px-5">
        <button onClick={back} className="-ml-2 p-2 text-ink">
          ←
        </button>
        <p className="text-[14px] font-medium text-ink-muted">Brand-in-a-Box</p>
      </div>

      <ScrollArea className="pt-4">
        <h1 className="hero-type text-[30px] text-ink">
          one build,
          <br />
          any brand
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          Both panels below are the same React components — including the{' '}
          {cardFinish === 'black' ? 'Black' : 'Iridescent'} card you chose. The only thing that
          changes between them is which theme the semantic tokens resolve to.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <MiniCardHome theme="arta" />
          <MiniCardHome theme="meridian" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniConfirm theme="arta" />
          <MiniConfirm theme="meridian" />
        </div>

        <Eyebrow className="mb-3 mt-7">What a partner can change</Eyebrow>
        <div className="divide-y divide-white/[0.07] overflow-hidden rounded-md border border-white/[0.08] bg-card">
          {[
            ['Brand accent & gradients', 'accent/brand, gradient/* — 11 semantic tokens'],
            ['Surface ramp', 'surface/bg, surface/card, surface/input'],
            ['Logo & card base colour', 'wordmark asset, --card-metal token'],
            ['Product & agent naming', 'content tokens, not layout'],
          ].map(([a, b]) => (
            <div key={a} className="flex items-start gap-3 px-4 py-3">
              <PencilSimple size={16} className="mt-[2px] shrink-0 text-positive" />
              <div>
                <p className="text-[14px] text-ink">{a}</p>
                <p className="text-[12px] text-ink-faint">{b}</p>
              </div>
            </div>
          ))}
        </div>

        <Eyebrow className="mb-3 mt-6">What they cannot</Eyebrow>
        <div className="divide-y divide-white/[0.07] overflow-hidden rounded-md border border-white/[0.08] bg-card">
          {[
            ['Disclosure content', 'Key facts, EIR copy, declaration text'],
            ['Decisioning & limits', 'Eligibility rules, affordability logic'],
            ['Security messaging', 'The Ask With Care module and its claims'],
            ['Step order & layout', 'Trust sequencing is a platform decision'],
            ['The Arta ring signature', 'Iridescent rings stay on every partner card'],
          ].map(([a, b]) => (
            <div key={a} className="flex items-start gap-3 px-4 py-3">
              <Lock size={16} weight="fill" className="mt-[2px] shrink-0 text-ink-faint" />
              <div>
                <p className="text-[14px] text-ink">{a}</p>
                <p className="text-[12px] text-ink-faint">{b}</p>
              </div>
            </div>
          ))}
        </div>

        <Surface className="mt-6">
          <Eyebrow>Why this is the boundary</Eyebrow>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Brand attributes are always tokens. Reasoning and compliance never are. A value that
            could make the product misleading if a partner changed it does not get a token — that
            rule, not a document, is what keeps the platform safe to open up.
          </p>
        </Surface>

        <div className="mt-5">
          <PillButton
            full
            onClick={() => setTheme(theme === 'arta' ? 'meridian' : 'arta')}
            icon={<Sparkle size={18} weight="fill" />}
          >
            Switch the whole app to{' '}
            {theme === 'arta' ? THEMES.meridian.brandName : THEMES.arta.brandName}
          </PillButton>
        </div>
      </ScrollArea>
      <TabNavRow active="more" />
    </div>
  )
}

/* --- The two mini panels. Same markup, different `data-theme`. ------------ */

function MiniShell({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div
      data-theme={theme}
      className="overflow-hidden rounded-md border border-white/[0.08] bg-bg p-3.5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-pill bg-brand">
          <span className="hero-type text-[13px] font-semibold text-white">{THEMES[theme].mark}</span>
        </span>
        <span className="truncate text-[11px] font-medium text-ink-muted">
          {THEMES[theme].brandName}
        </span>
      </div>
      {children}
    </div>
  )
}

function MiniCardHome({ theme }: { theme: Theme }) {
  const { cardFinish, kyc } = useApp()
  const used = statement.currentBalance
  const available = limits.approved - used
  return (
    <MiniShell theme={theme}>
      <p className="eyebrow text-[9px] text-ink-muted">Balance</p>
      <p className="tabular mt-1 text-[19px] font-semibold leading-none text-ink">{money0(used)}</p>
      <p className="tabular mt-1 text-[11px] text-positive">{money0(available)} available</p>
      <div className="mt-3">
        <AllocationBar
          height={4}
          showLegend={false}
          segments={[
            { label: 'Used', value: used, color: 'rgb(var(--accent-brand-alt))' },
            { label: 'Free', value: available, color: 'rgb(255 255 255 / 0.2)' },
          ]}
        />
      </div>
      {/* The real card art, the same finish chosen at Stage 1, scaled from its
          342px width to fit the panel. Each theme sets its own base colour and
          wordmark; the rings keep Arta's tones — the same card, rebranded. */}
      <div className="relative mt-3 h-[88px] w-full overflow-hidden rounded-[8px]">
        <div className="absolute left-0 top-0 w-[342px] origin-top-left" style={{ transform: 'scale(0.4064)' }}>
          <CardArt
            theme={theme}
            finish={cardFinish}
            sheen={false}
            holder={kyc[0].value.toUpperCase()}
            last4="4429"
          />
        </div>
      </div>
    </MiniShell>
  )
}

function MiniConfirm({ theme }: { theme: Theme }) {
  const { kyc } = useApp()
  return (
    <MiniShell theme={theme}>
      <p className="hero-type text-[15px] leading-tight text-ink">we already know you</p>
      <div className="mt-2.5 flex items-start gap-1.5">
        <CheckCircle size={12} weight="fill" className="mt-[2px] shrink-0 text-positive" />
        <p className="text-[10px] leading-snug text-ink-muted">8 fields pre-filled</p>
      </div>
      <div className="mt-2.5 space-y-2 rounded-sm border border-white/[0.08] bg-card p-2.5">
        {[
          ['Legal name', kyc[0].value],
          ['Tax residence', kyc.find((f) => f.id === 'tax')?.value ?? ''],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="eyebrow text-[8px] text-ink-faint">{l}</p>
            <p className="truncate text-[11px] text-ink">{v}</p>
          </div>
        ))}
      </div>
      {/* Identical compliance content in both themes — never a token. */}
      <p className="mt-2 text-[9px] leading-snug text-ink-faint">
        EIR {pa(cardTerms.eir)} — see key facts.
      </p>
      <div className="mt-2.5 rounded-pill bg-white py-1.5 text-center text-[10px] font-semibold text-black">
        Confirm
      </div>
      <p className="mt-2 text-[9px] text-ink-faint">Statement {money(statement.balance)}</p>
    </MiniShell>
  )
}
