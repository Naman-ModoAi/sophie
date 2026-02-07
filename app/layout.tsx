import type { Metadata } from "next";
import { Sora, Fraunces } from 'next/font/google';
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sophi - Never walk into a call cold",
  description: "AI-powered meeting preparation with Google Calendar integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
      </body>
    </html>
  );
}
