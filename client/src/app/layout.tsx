import { Montserrat } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import type { Metadata } from 'next';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SK Production',
  description: 'Profesyonel görüntü rejisi ve medya server çözümleri',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${montserrat.className} antialiased min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
