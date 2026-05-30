import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TripsProvider } from "@/lib/tripsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trippic — All your trips, in one place",
  description: "Relive every trip you've taken with beautiful postcards and AI summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 font-sans">
        <TripsProvider>{children}</TripsProvider>
      </body>
    </html>
  );
}
