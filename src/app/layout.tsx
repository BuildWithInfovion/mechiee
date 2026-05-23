import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mechiee — Doorstep Bike Service",
    template: "%s | Mechiee",
  },
  description:
    "Book two-wheeler servicing at your doorstep. Find nearby garages, track your mechanic live, and pay securely.",
  keywords: ["bike service", "two wheeler", "doorstep service", "mechanic", "India"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mechiee",
  },
  openGraph: {
    title: "Mechiee — Doorstep Bike Service",
    description: "Book two-wheeler servicing at your doorstep.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
