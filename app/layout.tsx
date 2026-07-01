import "@/app/styles/globals.css";
import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { incognito } from "./assets/font/font";
import { gitlabmono } from "./assets/font/font";
import Navbar from "./components/global/Navbar";
import Footer from "./components/global/Footer";
import PortfolioChatbot from "./components/shared/PortfolioChatbot";
import { Providers } from "./providers";
import { umamiSiteId } from "@/lib/env.api";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--inter",
});

const options = {
  title: "Ayush Kumar | Software Developer",
  description:
    "Ayush Kumar is a Software Developer and Technical Writer who is passionate about building solutions and contributing to open source communities",
  url: "https://ayushkumar.com",
  ogImage:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=90",
};

export const metadata: Metadata = {
  title: options.title,
  metadataBase: new URL(options.url),
  description: options.description,
  icons: {
    icon: [
      { url: "/favicon.png?v=2", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png?v=2",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: options.title,
    url: options.url,
    siteName: "ayushkumar.com",
    locale: "en-US",
    type: "website",
    description: options.description,
    images: options.ogImage,
  },
  alternates: {
    canonical: options.url,
  },
  other: {
    "google-site-verification": "IzcWMgn5Qjf-LCtA337KTGjivsf9bmod_1pZ-jxYQh8",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${incognito.variable} ${inter.className} ${gitlabmono.variable} dark:bg-zinc-900 bg-white dark:text-white text-zinc-700`}
      >
        <Providers>
          <Navbar />
          {children}
          <PortfolioChatbot />
          <Footer />
        </Providers>
      </body>
      {umamiSiteId ? (
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={umamiSiteId}
        />
      ) : null}
    </html>
  );
}
