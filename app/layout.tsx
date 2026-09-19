import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PERT-CPM Analyzer",
  description: "PERT and CPM Project Management Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}