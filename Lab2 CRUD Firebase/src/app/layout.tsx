import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Equipo · Catálogo de empleados',
  description:
    'Lab2 CRUD Firebase: catálogo de empleados con Next.js y Cloud Firestore.',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
