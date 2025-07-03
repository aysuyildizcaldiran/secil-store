import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
