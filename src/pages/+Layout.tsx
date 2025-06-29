
import React from 'react'
import { PageContextProvider } from './usePageContext'
import type { PageContext } from 'vike/types'
import '../index.css'

export default function Layout({ 
  children, 
  pageContext 
}: { 
  children: React.ReactNode
  pageContext: PageContext 
}) {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <div id="page-view">
          <div id="page-content">
            {children}
          </div>
        </div>
      </PageContextProvider>
    </React.StrictMode>
  )
}
