import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koinelio — One campus. Every connection.",
  description:
    "Koinelio is a global campus community platform connecting students, professors, college administrators, student clubs and alumni.",
  keywords: ["campus", "community", "students", "clubs", "events", "university"],
  authors: [{ name: "Koinelio" }],
  openGraph: {
    title: "Koinelio — One campus. Every connection.",
    description:
      "Discover student communities, organize events, connect with faculty and alumni, and be part of everything happening across your campus.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
