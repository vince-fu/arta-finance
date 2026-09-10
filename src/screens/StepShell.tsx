import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useApp, FLOW1_STEPS, type ScreenId } from '../appState'
import { AgentBadge, msg, useAgent } from '../components/agent'
import { ActionBar, ScreenHeader, ScrollArea } from '../components/chrome'

/**
 * Every application step shares this frame: back, progress stepper, the SAME
 * agent badge that appears on Card Home, a scrolling body, and a single
 * sticky primary action. One decision per screen (PRD §7.3).
 */
export function StepShell({
  screen,
  title,
  agentContext,
  agentOpener,
  children,
  action,
}: {
  screen: ScreenId
  title?: string
  agentContext: string
  agentOpener: string
  children: ReactNode
  action?: ReactNode
}) {
  const { back, canGoBack } = useApp()
  const { openAgent, setContext, messages } = useAgent()
  const stepIndex = FLOW1_STEPS.indexOf(screen) + 1

  return (
    <div className="flex h-full flex-col bg-bg">
      <ScreenHeader
        onBack={canGoBack ? back : undefined}
        title={title}
        step={stepIndex > 0 ? stepIndex : undefined}
        totalSteps={stepIndex > 0 ? FLOW1_STEPS.length : undefined}
        right={
          <AgentBadge
            onClick={() => {
              setContext(agentContext)
              // Seeds the thread only the first time — reopening later keeps
              // the earlier conversation intact (user story 5, AC 5.1).
              openAgent(messages.length === 0 ? [msg('agent', agentOpener)] : undefined)
            }}
          />
        }
      />
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <ScrollArea className="pt-4">{children}</ScrollArea>
      </motion.div>
      {action && <ActionBar>{action}</ActionBar>}
    </div>
  )
}
