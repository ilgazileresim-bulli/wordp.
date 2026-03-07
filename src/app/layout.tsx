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
  title: "Word P. — Ücretsiz Online Word ve PDF Editörü",
  description: "Word P. ile profesyonel Word belgeleri ve PDF dosyaları oluşturun, düzenleyin ve dönüştürün. Ücretsiz, tarayıcı tabanlı, kurulum gerektirmez.",
  keywords: ["word editörü", "pdf editörü", "online belge düzenleyici", "ücretsiz word", "pdf düzenleme", "belge oluşturma", "Word P"],
  authors: [{ name: "Word P." }],
  openGraph: {
    title: "Word P. — Ücretsiz Online Word ve PDF Editörü",
    description: "Profesyonel belge düzenleme deneyimi. Word & PDF desteği. Kurulum gerektirmez.",
    type: "website",
    locale: "tr_TR",
    siteName: "Word P.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word P. — Ücretsiz Online Word ve PDF Editörü",
    description: "Profesyonel belge düzenleme deneyimi. Word & PDF desteği.",
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
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
