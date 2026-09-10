# Arta Card — clickable mobile prototype

A high-fidelity, clickable prototype of a credit card product for Arta Finance, built from
`Arta-Card-Build-Prompt.md` and the PRD / ideation / user-story documents alongside it.

It covers **Flow 1** (the application, all the way to the decision states) and the **Flow 2** deep
moment (Smart Payoff), plus the Brand-in-a-Box white-label proof.

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. The app renders inside a fixed 390×844 phone frame on a
neutral backdrop, with a demo control panel beside it — it is built to present from, not to be
responsive.

Other commands:

```bash
npm run build
```

```bash
SINGLE_FILE=1 npm run build
```

The second produces one self-contained `dist/index.html` (~450 KB, no external files beyond the
Google Fonts stylesheet) — the easiest thing to hand someone or open offline.

## The 14 screens

| # | Screen | Feature it implements |
|---|--------|----------------------|
| 1 | Entry | No-Risk Preview intro, save & resume entry point |
| 2 | Eligibility result | **No-Risk Preview** (incl. the "not eligible yet" state) |
| 3 | Confirm your details | **Already Yours** |
| 4 | Income & employment | **Ask With Care** |
| 5 | Requested limit | Limit slider + **Plain as Day** appears and persists |
| 6 | Settlement & autopay | Defaults to Arta Cash |
| 7 | Key facts | **Plain as Day**, in full |
| 8 | Declaration & consent | References the same key-facts component, not a copy |
| 9 | Review & submit | Edit affordances back into any step |
| 10 | Decision | Approved / Pending / Declined — **Never Left Hanging** |
| 11 | Card Home | Reference screen 2's language, `AllocationBar` as the limit meter |
| 12 | Smart Payoff | **The deep moment** — live interest-vs-yield arithmetic |
| 13 | Lifecycle map | **Money Mind** across all five stages |
| 14 | Brand-in-a-Box | The token swap, side by side |

`Money Mind` (the chat surface) is not a screen — it is mounted once above every screen and holds
one continuous thread, which is the point of user story 5.

## What actually works (not just looks clickable)

- **The limit slider** updates the requested amount and the CTA.
- **The disclosure cards** expand and collapse, everywhere they appear.
- **Smart Payoff recomputes for real.** `src/lib/payoff.ts` holds the arithmetic; every dollar
  figure on screen and every sentence the agent says is derived from it. Asking "what if I pay
  half now?" — as a pill or as free text — re-runs the same functions.
- **The affordability guard is real.** Flip *Low cash balance* in the demo panel and the
  recommendation steps down to the largest affordable payment and explains why; unaffordable
  options disable themselves.
- **The theme swap is real.** Flip *Partner theme* and every screen re-skins from the semantic
  token layer. No component holds a hex value.
- **Save & resume** — reaching any application step records progress, and the entry screen then
  offers "Continue your application".

## Demo controls

Outside the phone, deliberately visible rather than hidden: jump to any screen, switch the
decision outcome (there is no decisioning engine behind this — that's a stated limitation, not a
concealed one), switch the partner theme, and drop the cash balance to exercise the
affordability path.

## Architecture

```
src/
  styles/tokens.css     Layer 1 primitives → layer 2 semantic → layer 3 theme
  lib/mockData.ts       All data. No backend, no persistence.
  lib/payoff.ts         The Smart Payoff arithmetic.
  components/           The 8 core design-system components.
  screens/              Flow 1, Flow 2, Brand-in-a-Box.
  appState.tsx          Screen state machine + application data + save/resume.
```

The eight core components are `PillButton`, `GradientCard`, the grain overlay, `AllocationBar`,
`DisclosureCard`, `StatFooterBar`, `TabNavRow`, and `AIMessageBubble` / `ChatSurface`. They are in
`components/`, and every screen is assembled from them.

**Tokens.** Colour, radius and gradient values live only in `styles/tokens.css`. Components
reference semantic names (`bg`, `ink`, `brand`, `positive`, `--gradient-premium`) through the
Tailwind theme. Switching `data-theme` from `arta` to `meridian` re-binds the semantic layer — that
is the whole of Brand-in-a-Box, and it's why the partner panels in screen 14 need no separate
markup.

**Grain.** Defined once as a data-URI `feTurbulence` texture in the `--grain-url` token and applied
by the `.grain` class to every gradient surface — hero panels, asset cards and the card art alike.

## Deliberate non-goals

No authentication, KYC, or credit-bureau integration. No backend. No native build. No settings or
statement history beyond the one deep moment. One reskinned pair of screens for the white-label
proof rather than a second full flow.

## Design system for Figma

The Figma MCP connection wasn't authorised in the session that built this, so Deliverable 2 ships
as `../Arta-Card-Design-System-Spec.md` — the full token table (both modes), text and effect
styles, and every component's variant/property spec, written so it can be built in Figma directly
from the document. It mirrors this codebase 1:1.
# arta-finance
