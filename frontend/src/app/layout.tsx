import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NexusAI — AI Model Hub · Discover, Compare & Deploy',
  description: 'Access 400+ AI models in one place. Chat, compare, and deploy AI models for any use case.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
