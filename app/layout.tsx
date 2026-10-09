import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Poppins } from "next/font/google";
import "../styles/globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import PageTransition from "@/components/PageTransition";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeIndicator from "@/components/HomeIndicator";
import ImageGuard from "@/components/ImageGuard";
import ScrollReveal from "@/components/ScrollReveal";
import { SITE } from "@/lib/site-config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Display serif for headings.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Script accent — used sparingly for signatures.
const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VB Photographe — Photographs that hold their breath",
  description:
    "Bridal, groom, candid, baby and traditional wedding photography by VB Photographe. Salem, India. Selected work, 2015 — present.",
  metadataBase: new URL("https://vbphotographe.example"),
  openGraph: {
    title: "VB Photographe — Photography",
    description: "Photographs that hold their breath.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${serif.variable} ${script.variable}`}
    >
      <body>
        <SmoothScroll>
          <Cursor />
          <PageTransition />
          <Nav
            logoSrc={SITE.logoMark?.src ?? SITE.logo?.src ?? null}
            contact={{
              phone: SITE.phones[0],
              instagram: SITE.social.instagram,
              location: SITE.location,
            }}
          />
          <main>{children}</main>
          <Footer />
          <HomeIndicator />
          <ImageGuard />
          <ScrollReveal />
        </SmoothScroll>
      </body>
    </html>
  );
}
