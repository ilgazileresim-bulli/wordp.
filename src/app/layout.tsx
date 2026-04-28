import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Macrotar — Free Online Word and PDF Editor",
  description: "Create, edit, and convert professional Word documents and PDF files with Macrotar. Free, browser-based, no installation required.",
  keywords: ["word editor", "pdf editor", "online document editor", "free word", "edit pdf", "document creation", "Macrotar"],
  authors: [{ name: "Macrotar" }],
  openGraph: {
    title: "Macrotar — Free Online Word and PDF Editor",
    description: "Professional document editing experience. Word & PDF support. No installation required.",
    type: "website",
    locale: "en_US",
    siteName: "Macrotar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Macrotar — Free Online Word and PDF Editor",
    description: "Professional document editing experience. Word & PDF support.",
  },
  robots: { index: true, follow: true },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
