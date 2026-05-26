import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyuciin Aja - Laundry Sepatu Online",
  description:
    "Platform laundry sepatu online terpercaya di Semarang. Antar-jemput, tracking real-time, dan harga transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-n0pY9j2fnVp2GXpq"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}