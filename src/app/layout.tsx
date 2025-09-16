import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

import { Toaster } from "sonner";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Teacher Training LMS",
    template: "%s | Teacher Training LMS",
  },
  description: "A comprehensive Learning Management System designed for teacher training and professional development.",
  keywords: ["teacher training", "LMS", "learning management system", "professional development", "education", "e-learning"],
  authors: [{ name: "Your Name or Organization" }], // Consider updating this
  creator: "Your Name or Organization", // Consider updating this
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-lms-domain.com", // Update with your actual domain
    title: "Teacher Training LMS",
    description: "A comprehensive Learning Management System designed for teacher training and professional development.",
    siteName: "Teacher Training LMS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teacher Training LMS",
    description: "A comprehensive Learning Management System designed for teacher training and professional development.",
    creator: "@yourtwitterhandle", // Update with your actual Twitter handle
  },
  // Add other metadata as needed, e.g., icons, manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#6366F1" }, // Tailwind's indigo-500
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased tracking-tighter`}
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
