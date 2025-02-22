import type { Metadata } from "next";
import { Ubuntu } from 'next/font/google';
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Lost Cities",
  description: "Lost Cities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <body className="font-ubuntu antialiased">
        {children}
      </body>
    </html>
  );
}
