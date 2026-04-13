'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
    // We only create profiles for identified users (to save cost and respect privacy)
    person_profiles: 'identified_only', 
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  // If PostHog isn't configured, just return children
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }
  
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
