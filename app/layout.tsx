import type { Metadata } from 'next';
import { Syne, DM_Mono } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Study Site',
  description: 'Interactive study quizzes — multiple choice, fill-in-the-blank, and learn mode',
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${syne.variable} ${dmMono.variable}`}>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
