import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Orvan Platform",
  description: "Financial Data Retrieval",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased h-screen bg-[var(--background)] flex flex-col text-sm overflow-hidden`}>
        <Navbar />
        {/* The children prop will render your individual pages (like chat, ingest, etc.) */}
        <div className="flex-1 flex overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}