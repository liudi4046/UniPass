import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniPass - Global Anonymous Identity",
  description: "One Passport, Infinite Anonymous Identities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}

