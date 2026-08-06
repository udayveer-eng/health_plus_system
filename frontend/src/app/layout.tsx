import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// We use Inter as the closest readily available font to Geist for a premium look
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HealthPulse | Premium Healthcare OS",
  description: "Next-generation telemedicine and hospital management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* The subtle global animated gradient backgrounds */}
        <div className="animated-bg" />
        
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
