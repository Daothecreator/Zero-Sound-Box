import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivifactor Elements",
  description: "A precise, non-commercial acoustic and visual instrument.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
