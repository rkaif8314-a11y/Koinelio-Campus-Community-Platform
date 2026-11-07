import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Koinelio — One campus. Every connection.",
  description:
    "Koinelio is an independent campus community pilot for student profiles, clubs, events, conversations and alumni connections.",
  keywords: ["campus", "community", "students", "clubs", "events", "university"],
  authors: [{ name: "Koinelio" }],
  openGraph: {
    title: "Koinelio — One campus. Every connection.",
    description:
      "Discover campus communities, follow conversations, find events and connect with alumni.",
    type: "website",
    siteName: "Koinelio",
    locale: "en_IN",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
