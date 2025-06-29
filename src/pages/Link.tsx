
import React from 'react'
import { usePageContext } from './usePageContext'

export function Link(props: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const pageContext = usePageContext()
  const { urlPathname } = pageContext
  const isActive = props.href === '/' ? urlPathname === props.href : urlPathname.startsWith(props.href)

  return (
    <a 
      {...props} 
      className={`${props.className || ''} ${isActive ? 'is-active' : ''}`}
    />
  )
}
