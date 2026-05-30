import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TripsProvider } from "@/lib/tripsContext";
import { AuthProvider } from "@/lib/authContext";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${jakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F5F5] font-[family-name:var(--font-jakarta)]">
        <AuthProvider>
          <TripsProvider>{children}</TripsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
