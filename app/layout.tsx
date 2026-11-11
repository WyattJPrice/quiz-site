import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './library.css';
import './dashboard.css';

const sora = localFont({
  src: './fonts/sora-latin.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-sora',
  display: 'swap',
});

const geist = localFont({
  src: './fonts/geist-latin.woff2',
  weight: '400 600',
  style: 'normal',
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/geist-mono-latin.woff2',
  weight: '400 600',
  style: 'normal',
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Study Library — Wyatt Price',
  description:
    'A study library for organizing sets by subject, studying, and taking practice tests.',
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sora.variable} ${geist.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
