import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Market",
  description:
    "Track and analyze stock market data with our powerful tools and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${manrope.variable} font-[family-name:var(--font-manrope)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
