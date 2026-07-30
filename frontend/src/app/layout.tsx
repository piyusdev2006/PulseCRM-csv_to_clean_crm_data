import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeToggle';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'PulseCRM AI - Intelligent CSV Importer',
  description:
    'AI-powered CSV importer that uses Google Gemini 2.0 Flash to automatically map and extract CRM lead data from any spreadsheet format.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
