import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'  // ← Make sure this line exists
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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}