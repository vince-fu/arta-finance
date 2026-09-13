/* ============================================================================
   All prototype data lives here. No backend, no persistence, no decisioning.
   ========================================================================== */

export type Theme = 'arta' | 'meridian'

export interface ThemeMeta {
  id: Theme
  brandName: string
  /** The lowercase circular badge mark, e.g. Arta's "a". */
  mark: string
  cardName: string
  /** The settlement account's brand name — a partner's client must never see
   *  "Arta Cash" (user story 8b, AC 8b.1). */
  cashName: string
  /** The AI identity customers see — Arta's existing "Arta AI" brand. */
  agentName: string
  /** The agent's role within that AI, in the style of Arta's agent family
   *  (Investment Planner, Product Specialist, Research Analyst). */
  agentRole: string
}

/** Theme metadata is *content*, not layout — the other half of the skin. */
export const THEMES: Record<Theme, ThemeMeta> = {
  arta: {
    id: 'arta',
    brandName: 'Arta',
    mark: 'a',
    cardName: 'Arta Card',
    cashName: 'Arta Cash',
    agentName: 'Arta AI',
    agentRole: 'Card Concierge',
  },
  meridian: {
    id: 'meridian',
    brandName: 'Meridian Invest',
    mark: 'm',
    cardName: 'Meridian Card',
    cashName: 'Meridian Cash',
    // AC 8b.3 — the partner names the agent; the reasoning underneath is Arta's.
    // Not "Advisor": "financial adviser" is a regulated title in Singapore.
    agentName: 'Meridian AI',
    agentRole: 'Card Concierge',
  },
}

/**
 * Active theme *content*, readable from non-React modules (payoff.ts writes
 * the agent's reasoning strings and has no access to React context).
 * `AppProvider` keeps this in step with the theme on every render.
 */
export const activeBrand = { ...THEMES.arta }
export function setActiveBrand(t: Theme) {
  Object.assign(activeBrand, THEMES[t])
}

/* ---------- The member ---------------------------------------------------- */

export const member = {
  firstName: 'Vince',
  greeting: 'Vince Foo',
  portfolioValue: 2_345_681.77,
  portfolioChange: 120_334.0,
  /** What Arta already holds from KYC. "Already Yours" reads only from here. */
  // A Singapore citizen, as verified through Singpass MyInfo at Arta onboarding.
  // All values are fictional; the NRIC is masked the way it would be on screen.
  // `name` stays first — the card art reads the holder name from it.
  kyc: [
    { id: 'name', label: 'Name (as in NRIC)', value: 'Vince Foo' },
    { id: 'nric', label: 'NRIC', value: 'S•••••472J' },
    { id: 'dob', label: 'Date of birth', value: '14 March 1986' },
    { id: 'nationality', label: 'Nationality', value: 'Singaporean (Citizen)' },
    { id: 'tax', label: 'Tax residence', value: 'Singapore' },
    { id: 'address', label: 'Residential address', value: 'Blk 128 Bishan Street 12, #09-214, Singapore 570128' },
    { id: 'email', label: 'Email', value: 'vince.foo@example.com' },
    { id: 'phone', label: 'Mobile', value: '+65 9••• 4429' },
  ],
  /** Linked income signals — pre-fillable, still confirmable (Ask With Care). */
  income: {
    employer: 'Halcyon Systems Pte Ltd',
    status: 'Employed · full time',
    annual: 480_000,
    other: 62_000,
  },
}

/* ---------- Accounts ------------------------------------------------------ */

export const accounts = [
  { id: 'cash', name: 'Arta Cash', detail: 'SGD •••• 8821', balance: 12_480.0, yieldPa: 0.03, preferred: true },
  { id: 'treasury', name: 'SGS T-bills', detail: 'Ladder · 3.2% p.a. avg', balance: 100_000.0, yieldPa: 0.032, preferred: false },
  { id: 'external', name: 'DBS Multiplier', detail: 'SGD •••• 3310', balance: 24_900.0, yieldPa: 0.0035, preferred: false },
]

/* ---------- Card product & terms ------------------------------------------ */

export const cardTerms = {
  /** Effective interest rate, p.a. — how Singapore cards quote interest
   *  (compounding included). Illustrative, typical of the Singapore market. */
  eir: 0.278,
  cashAdvanceEir: 0.285,
  annualFee: 0,
  fxFee: 0,
  lateFee: 100,
  minimumDuePct: 0.03,
  minimumDueFloor: 50,
  interestFreeDays: 25,
  cashBack: 0.02,
}

/** "Plain as Day" — the persistent key-facts card reads exactly this list, and
 *  the Declaration step references the same array (AC 3.3, no duplicate copy). */
export const keyFacts = [
  { label: 'Interest rate (EIR)', value: '27.8% p.a.', detail: 'Effective interest rate on any balance not paid in full by the due date. No interest if you pay your full statement balance.' },
  { label: 'Interest-free period', value: 'Up to 25 days', detail: 'From your statement date to the payment due date, on new purchases, when your previous balance was paid in full.' },
  { label: 'Minimum payment', value: '3% or S$50', detail: 'Of your outstanding balance, whichever is higher. Paying only the minimum means interest is charged on the rest.' },
  { label: 'Late payment fee', value: 'S$100', detail: 'Charged if the minimum payment is not received by the due date. Setting up auto-debit avoids this.' },
  { label: 'Cash advance', value: 'EIR 28.5% p.a.', detail: 'A fee of 8% of the amount or S$15, whichever is higher, plus interest from the day of withdrawal. No interest-free period.' },
  { label: 'Annual fee', value: 'None', detail: 'No annual fee for Arta members, for the life of the card.' },
  { label: 'Foreign currency transaction fee', value: 'None', detail: 'Spend in any currency at the card network rate. We add nothing on top.' },
  { label: 'Rewards', value: '2% cash back', detail: 'On all eligible spend, credited monthly. Can be swept into your Arta portfolio automatically.' },
]

/* ---------- Credit limit -------------------------------------------------- */

export const limits = {
  /** What the soft pre-qualification returns. No credit-bureau hard pull. */
  prequalifiedCeiling: 75_000,
  min: 5_000,
  step: 1_000,
  defaultRequest: 50_000,
  /** What the (mock) decision actually approves. */
  approved: 65_000,
}

/* ---------- Statement (Flow 2 · Smart Payoff) ----------------------------- */

export const statement = {
  balance: 4_182.6,
  dueDate: '28 September',
  daysUntilDue: 12,
  cycleDays: 30,
  closedOn: '3 September',
  currentBalance: 5_106.44,
  rewardsEarned: 83.65,
}

export const recentSpend = [
  { id: 't1', merchant: 'Singapore Airlines', category: 'Travel', amount: 1_842.0, date: '2 Sep' },
  { id: 't2', merchant: 'Atlas Bar', category: 'Dining', amount: 268.4, date: '31 Aug' },
  { id: 't3', merchant: 'Apple Store', category: 'Technology', amount: 1_299.0, date: '27 Aug' },
  { id: 't4', merchant: 'NTUC FairPrice', category: 'Groceries', amount: 214.2, date: '26 Aug' },
  { id: 't5', merchant: 'Grab', category: 'Transport', amount: 58.9, date: '25 Aug' },
]

/* ---------- Flow 2 lifecycle map ------------------------------------------ */

export const lifecycle = [
  { stage: 'Apply', detail: 'Pre-qualification, form assistance, plain-language disclosures.', built: true },
  { stage: 'Onboard', detail: 'Wallet setup, first-use tips, a smart auto-debit default.', built: false },
  { stage: 'Everyday', detail: 'Spend insight, real-time alerts, “what was this charge?”', built: false },
  { stage: 'Manage', detail: 'Repayment guidance, disputes, statement Q&A, travel locks.', built: true },
  { stage: 'Grow', detail: 'Rewards optimisation, credit building, spare cash into the portfolio.', built: false },
]
