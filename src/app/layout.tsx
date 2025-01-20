import './globals.css'

export const metadata = {
  title: 'WRM',
  description: "PT. Bimaruna Jaya's Warehouse Report Management System"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}