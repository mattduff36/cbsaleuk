import type { Metadata } from "next";
import { Manrope, Public_Sans } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://carbootsale.com"),
  title: {
    default: `${BRAND.name} | Find UK Car Boot Sales`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "car boot sale",
    "uk car boot sales",
    "find car boot sales near me",
    "boot sale organiser",
    "car boot tips",
  ],
  openGraph: {
    title: `${BRAND.name} | Find UK Car Boot Sales`,
    description: BRAND.description,
    url: "https://carbootsale.com",
    siteName: BRAND.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | Find UK Car Boot Sales`,
    description: BRAND.description,
  },
  alternates: {
    canonical: "https://carbootsale.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${publicSans.variable}`}>
      <body className="min-h-screen bg-brand-cream font-sans text-brand-ink antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
