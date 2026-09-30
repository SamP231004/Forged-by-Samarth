import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { FloatingChat } from "@/components/floating-chat";
import { Footer } from "@/components/footer";
import { IntroLoader } from "@/components/intro-loader";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { site } from "@/lib/site";
import { jsonLd, personSchema } from "@/lib/structured-data";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "hire freelance developer",
    "freelance software developer",
    "hire software developer",
    "freelance web developer",
    "hire app developer",
    "build an app",
    "mobile app development",
    "website development",
    "MVP development for startups",
    "freelance developer India",
    "Next.js developer",
    "React developer",
    "Spring Boot developer",
    "React Native developer",
    "MVP development",
    "SaaS development",
    "Samarth Patel",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
  // Paste the token from Google Search Console → Settings → Ownership verification (HTML tag).
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before paint so returning visitors never see the intro overlay.
const introScript = `try{if(sessionStorage.getItem('intro-seen'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema()) }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>
          <a
            href="#main"
            className="fixed left-4 top-4 z-[200] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-transform focus:translate-y-0"
          >
            Skip to content
          </a>
          <IntroLoader />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <FloatingChat />
        </Providers>
      </body>
    </html>
  );
}
