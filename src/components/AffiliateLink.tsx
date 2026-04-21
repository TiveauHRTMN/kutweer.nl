
'use client'

import posthog from 'posthog-js'
import React from 'react'

interface AffiliateLinkProps {
  href: string
  productId: string
  title: string
  persona?: string
  className?: string
  children: React.ReactNode
}

export default function AffiliateLink({ 
  href, 
  productId, 
  title, 
  persona, 
  className,
  children 
}: AffiliateLinkProps) {
  
  const handleClick = () => {
    posthog.capture('affiliate_click', {
      product_id: productId,
      product_title: title,
      persona: persona || 'none',
      url: href
    })
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
