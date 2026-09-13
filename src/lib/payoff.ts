import { accounts, activeBrand, cardTerms, statement } from './mockData'

/* ============================================================================
   Smart Payoff — the arithmetic behind the deep moment.

   This is deliberately real (not a hardcoded string): every number the agent
   says on screen comes out of these functions, so the "what if I pay half?"
   follow-up genuinely recomputes rather than swapping copy. (User story 6b.1)
   ========================================================================== */

export const cashAccount = accounts[0]
/** The settlement account's display name under the current theme. */
export const cashName = () => activeBrand.cashName

/** Interest the card charges on a balance carried for `days`, compounded at the EIR. */
export function interestOn(balance: number, days = statement.cycleDays) {
  return balance * ((1 + cardTerms.eir) ** (days / 365) - 1)
}

/** Interest given up by moving money out of Arta Cash for the same window. */
export function yieldForgone(amount: number, days = statement.cycleDays) {
  return amount * ((1 + cashAccount.yieldPa) ** (days / 365) - 1)
}

export const minimumDue = Math.max(
  statement.balance * cardTerms.minimumDuePct,
  cardTerms.minimumDueFloor,
)

export interface Scenario {
  /** Amount paid now, from Arta cash. */
  payment: number
  /** Balance still revolving after the payment. */
  carried: number
  /** Interest that balance will accrue over the next cycle. */
  interest: number
  /** Yield the member gives up by spending the cash now. */
  forgone: number
  /** Total cost of this choice over the cycle (interest + yield given up). */
  totalCost: number
  /** How much better/worse this is than paying only the minimum. */
  vsMinimum: number
  /** False when the member's cash cannot cover it (AC 6a.3). */
  affordable: boolean
}

export function scenario(payment: number, cashBalance = cashAccount.balance): Scenario {
  const paid = Math.min(Math.max(payment, 0), statement.balance)
  const carried = statement.balance - paid
  const interest = interestOn(carried)
  const forgone = yieldForgone(paid)
  const totalCost = interest + forgone

  const minCarried = statement.balance - minimumDue
  const minCost = interestOn(minCarried) + yieldForgone(minimumDue)

  return {
    payment: paid,
    carried,
    interest,
    forgone,
    totalCost,
    vsMinimum: minCost - totalCost,
    affordable: paid <= cashBalance,
  }
}

export type RecommendationId = 'full' | 'partial' | 'minimum'

export interface Recommendation {
  id: RecommendationId
  headline: string
  /** The plain-dollar reasoning, already resolved to numbers. */
  reasoning: string
  scenario: Scenario
  /** Set when we had to step down from "pay in full" for affordability. */
  constrainedBy?: string
}

/**
 * Picks the best action the member can actually afford.
 *
 * The rule is not "always pay in full" — it is "compare the interest avoided
 * against the yield given up, then filter by what's affordable". With a 27.8% p.a.
 * EIR against a 3% p.a. cash rate, paying in full wins; the function still derives it
 * rather than asserting it, so a low-cash member gets a different answer.
 */
export function recommend(cashBalance = cashAccount.balance): Recommendation {
  const full = scenario(statement.balance, cashBalance)

  if (full.affordable) {
    const interestAvoided = interestOn(statement.balance)
    return {
      id: 'full',
      headline: `Pay S$${fmt(statement.balance)} in full from ${cashName()}`,
      reasoning:
        `Paying in full avoids S$${fmt(interestAvoided)} in interest. The S$${fmt(statement.balance)} ` +
        `leaving your ${cashName()} gives up about S$${fmt(full.forgone)} of interest it would have earned this ` +
        `cycle — so you finish S$${fmt(interestAvoided - full.forgone)} ahead.`,
      scenario: full,
    }
  }

  // Not enough cash for the full balance — recommend the largest affordable
  // payment instead, and say plainly why. Never recommend the unaffordable.
  const affordable = Math.max(Math.min(cashBalance, statement.balance), minimumDue)
  const partial = scenario(affordable, cashBalance)
  return {
    id: affordable >= statement.balance ? 'full' : 'partial',
    headline: `Pay S$${fmt(affordable)} from ${cashName()}`,
    reasoning:
      `Your ${cashName()} holds S$${fmt(cashBalance)}, so paying the full ` +
      `S$${fmt(statement.balance)} isn't possible this cycle. Paying S$${fmt(affordable)} ` +
      `leaves S$${fmt(statement.balance - affordable)} revolving at ${pa(cardTerms.eir)} — ` +
      `about S$${fmt(partial.interest)} in interest — which is still ` +
      `S$${fmt(partial.vsMinimum)} better than paying the minimum.`,
    scenario: partial,
    constrainedBy: 'available cash',
  }
}

export function fmt(n: number, dp = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

export function money(n: number, dp = 2) {
  return `S$${fmt(n, dp)}`
}

export function money0(n: number) {
  return `S$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

/**
 * How long a balance takes to clear, and what it costs, paying only the
 * minimum each month (the greater of 3% or S$50) at the card's EIR. Powers the
 * key-facts warning, so the figure is calculated rather than typed in.
 */
export function minimumOnlyPayoff(balance: number) {
  const monthlyRate = (1 + cardTerms.eir) ** (1 / 12) - 1
  let remaining = balance
  let months = 0
  let interest = 0
  while (remaining > 0.005 && months < 1200) {
    const charge = remaining * monthlyRate
    const payment = Math.min(
      Math.max(remaining * cardTerms.minimumDuePct, cardTerms.minimumDueFloor),
      remaining + charge,
    )
    remaining += charge - payment
    interest += charge
    months += 1
  }
  return { months, years: months / 12, interest }
}

/** A rate as Singapore cards and deposits quote it, e.g. "27.8% p.a.". */
export function pa(rate: number) {
  return `${(rate * 100).toFixed(1)}% p.a.`
}
