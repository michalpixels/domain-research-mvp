import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ReactQueryProvider } from '@/lib/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DomainInsight - Professional Domain Research Tool',
  description: 'Comprehensive WHOIS, DNS, and security analysis for domain investors and professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Providers should be inside the body */}
        <ClerkProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}