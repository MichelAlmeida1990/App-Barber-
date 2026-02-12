import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientToaster from '@/components/ClientToaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BARBEARIA DO DUDÃO - Sistema de Gerenciamento',
  description: 'Sistema de gerenciamento para BARBEARIA DO DUDÃO - Since 2020',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <ClientToaster />
      </body>
    </html>
  )
}
