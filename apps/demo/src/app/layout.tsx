import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'zm-editor Demo',
  description: 'Notion-like rich text editor for React/Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
