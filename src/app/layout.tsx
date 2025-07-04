import { ReactNode } from 'react';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import SessionClientProvider from './SessionClientProvider';

export const metadata: Metadata = {
  title: 'Secil Store',
  description: 'Secil Store uygulaması için örnek Next.js layout',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <SessionClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </SessionClientProvider>
      </body>
    </html>
  );
}
