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
      <head>
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.onrender.com https://*.vercel.app https://*.supabase.co https://*.google.com https://ipapi.co; frame-src 'self' https://*.google.com;"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <ClientToaster />
      </body>
    </html>
  )
}
