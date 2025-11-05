import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { WebVitals } from '@/components/WebVitals';
import { WalletPersistence } from '@/components/WalletPersistence';
import { MetricsReporter } from '@/components/MetricsReporter';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cybersyn 2.0 - Governança On-Chain",
  description:
    "Sistema de votação híbrida biomimético-cibernética para a Revolução Cibernética",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <WalletPersistence />
          <MetricsReporter />
          {children}
        </Providers>
        <WebVitals />
      </body>
    </html>
  );
}
