import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { WebVitals } from '@/components/WebVitals';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cybersyn 2.0 - Governança On-Chain",
  description:
    "Sistema de votação híbrida biomimético-cibernética para a Revolução Cibernética",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <WebVitals />
      </body>
    </html>
  );
}
