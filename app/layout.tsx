import type { Metadata } from 'next';
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Callback — Know your odds before you apply',
  description: 'Callback scores every job listing 0–100 for your exact resume. Skip the 47 that won\'t answer. Spend your afternoon on the 3 that will.',
  metadataBase: new URL('https://joincallback.com'),
  icons: {
    icon: [
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/logo-192.png', sizes: '192x192' },
    shortcut: '/logo-192.png',
  },
  openGraph: {
    title: 'Callback — Know your odds before you apply',
    description: 'Job scoring that tells you your actual odds.',
    type: 'website',
    url: 'https://joincallback.com',
    images: [{ url: '/logo-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'Callback',
    description: 'Know your odds before you apply.',
    images: ['/logo-512.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-density="cozy"
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{ fontFamily: 'var(--font-inter-tight), "Inter", -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
