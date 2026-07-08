import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RF Acoustic Synthesizer",
  description: "High-fidelity Zeno-effect frequency modulation",
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
