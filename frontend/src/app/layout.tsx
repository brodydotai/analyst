import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atlas",
  description: "Personal market intelligence dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brodus-background text-brodus-text">
        {children}
      </body>
    </html>
  );
}
