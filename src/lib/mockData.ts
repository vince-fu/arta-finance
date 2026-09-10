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
  agentName: string
  agentTagline: string
}

/** Theme metadata is *content*, not layout — the other half of the skin. */
export const THEMES: Record<Theme, ThemeMeta> = {
  arta: {
    id: 'arta',
    brandName: 'Arta',
    mark: 'a',
    cardName: 'Arta Card',
    cashName: 'Arta Cash',
    agentName: 'Money Mind',
    agentTagline: 'your spending & credit companion',
  },
  meridian: {
    id: 'meridian',
    brandName: 'Meridian Invest',
    mark: 'm',
    cardName: 'Meridian Card',
    cashName: 'Meridian Cash',
    // AC 8b.3 — the partner names the agent; the reasoning underneath is Arta's.
    agentName: 'Meridian Advisor',
    agentTagline: 'your spending & credit companion',
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
  kyc: [
    { id: 'name', label: 'Legal name', value: 'Vince Foo' },
    { id: 'dob', label: 'Date of birth', value: '14 March 1986' },
    { id: 'id', label: 'Passport / ID', value: 'E•••••472 · United States' },
    { id: 'nationality', label: 'Nationality', value: 'United States' },
    { id: 'tax', label: 'Tax residence', value: 'United States · Singapore' },
    { id: 'address', label: 'Residential address', value: '18 Marina Blvd, #34-02, Singapore 018980' },
    { id: 'email', label: 'Email', value: 'vince.foo@example.com' },
    { id: 'phone', label: 'Mobile', value: '+65 •••• 4429' },
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
  { id: 'cash', name: 'Arta Cash', detail: 'USD •••• 8821', balance: 12_480.0, yieldApy: 0.046, preferred: true },
  { id: 'treasury', name: 'US Treasuries', detail: 'Ladder · 4.9% avg', balance: 100_000.0, yieldApy: 0.049, preferred: false },
  { id: 'external', name: 'DBS Multiplier', detail: 'SGD •••• 3310', balance: 24_900.0, yieldApy: 0.0035, preferred: false },
]

/* ---------- Card product & terms ------------------------------------------ */

export const cardTerms = {
  apr: 0.2499,
  aprCash: 0.2799,
  annualFee: 0,
  annualFeeLabel: 'No annual fee',
  fxFee: 0,
  lateFee: 40,
  minimumDuePct: 0.03,
  minimumDueFloor: 25,
  gracePeriodDays: 25,
  cashBack: 0.02,
}

/** "Plain as Day" — the persistent key-facts card reads exactly this list, and
 *  the Declaration step references the same array (AC 3.3, no duplicate copy). */
export const keyFacts = [
  { label: 'Purchase APR', value: '24.99% variable', detail: 'Applied to any balance carried past the statement due date. No interest if you pay in full.' },
  { label: 'Cash advance APR', value: '27.99% variable', detail: 'Accrues from the day of the advance. There is no grace period on cash advances.' },
  { label: 'Annual fee', value: 'None', detail: 'No annual fee for Arta members, for the life of the card.' },
  { label: 'Foreign transaction fee', value: 'None', detail: 'Spend in any currency at the network rate. We add nothing on top.' },
  { label: 'Late payment fee', value: 'Up to $40', detail: 'Charged if the minimum due is not received by the due date. Autopay avoids this.' },
  { label: 'Minimum payment', value: '3% or $25', detail: 'Whichever is greater. Paying only the minimum means interest is charged on the rest.' },
  { label: 'Grace period', value: '25 days', detail: 'From statement close to due date, on purchases, when the prior balance was paid in full.' },
  { label: 'Rewards', value: '2% cash back', detail: 'On all spend, credited monthly. Can be swept into your Arta portfolio automatically.' },
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
  { stage: 'Onboard', detail: 'Wallet setup, first-use tips, a smart autopay default.', built: false },
  { stage: 'Everyday', detail: 'Spend insight, real-time alerts, “what was this charge?”', built: false },
  { stage: 'Manage', detail: 'Repayment guidance, disputes, statement Q&A, travel locks.', built: true },
  { stage: 'Grow', detail: 'Rewards optimisation, credit building, spare cash into the portfolio.', built: false },
]
