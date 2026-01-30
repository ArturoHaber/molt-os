import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Molt-OS | AI That Works For You",
  description: "Your personal AI assistant, fully managed. No terminals, no API keys, no config files. Just sign in and chat.",
  openGraph: {
    title: "Molt-OS | AI That Works For You",
    description: "Your personal AI assistant, fully managed. No terminals, no API keys, no config files.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Molt-OS | AI That Works For You",
    description: "Your personal AI assistant, fully managed. No terminals, no API keys, no config files.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
