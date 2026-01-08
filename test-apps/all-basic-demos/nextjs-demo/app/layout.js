import './globals.css'

export const metadata = {
  title: 'Next.js Environment Demo',
  description: 'Demo app showcasing environment variables',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
