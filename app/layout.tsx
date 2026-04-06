import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "QueryMe – AI-Powered SQL Query Platform",
  description:
    "QueryMe lets you ask questions in plain English and get instant SQL queries and results. Secure, role-based, and schema-aware AI database querying.",
  keywords: [
    "AI SQL",
    "natural language to SQL",
    "database querying",
    "SQL generator",
    "RBAC",
    "QueryMe",
    "AI database tool",
    "text to sql"
  ],
  authors: [{ name: "Neeraj Gupta" }],
  creator: "Neeraj Gupta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${GeistSans.className} ${GeistMono.className}`}
      >
        <body>{children}
        <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}