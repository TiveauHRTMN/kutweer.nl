'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { SessionProvider } from '@/lib/session-context'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    
    if (key && typeof window !== 'undefined') {
      posthog.init(key, {
        api_host: host || 'https://eu.posthog.com',
        person_profiles: 'always', // or 'identified_only'
        capture_pageview: false // We'll handle this in a dedicated component for better control
      })
    }
  }, [])

  return (
    <PostHogProvider client={posthog}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </PostHogProvider>
  )
}

