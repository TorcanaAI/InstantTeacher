import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "InstantTeacher | Homework Help & Exam Prep",
  description:
    "24/7 homework help, school support and exam prep with Sunshine and Jack. Step-by-step help, practice tests, streaks and badges. Australia.",
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#1e6f6f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <div className="min-h-screen flex flex-col">
          <Providers>
            <main className="flex-1">{children}</main>
          </Providers>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
