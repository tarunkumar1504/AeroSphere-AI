import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AeroSphere AI — Community & Family Winter Smog Defense',
  description: 'GenAI-powered assistant for severe winter smog and urban air pollution. Tailored low-emission routines, indoor air quality improvements, and verifiable sustainable impact analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="sr-only sr-only-focusable">
          Skip to main clean air content
        </a>
        {children}
      </body>
    </html>
  );
}
