import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import SupportFooter from "@/components/SupportFooter";
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
  title: "InstantTeacher | On-Demand Tutoring in WA",
  description:
    "Connect instantly with qualified educators for homework help and exam prep. No subscription. Australia.",
  manifest: "/manifest.json",
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
          <SupportFooter />
        </div>
      </body>
    </html>
  );
}
