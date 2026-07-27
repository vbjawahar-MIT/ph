import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import PageTransition from "@/components/PageTransition";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HomeIndicator from "@/components/HomeIndicator";
import { SITE } from "@/lib/site-config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
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
    <html lang="en" className={poppins.variable}>
      <body>
        <SmoothScroll>
          <Cursor />
          <PageTransition />
          <Nav logoSrc={SITE.logo?.src ?? null} />
          <main>{children}</main>
          <Footer />
          <HomeIndicator />
        </SmoothScroll>
      </body>
    </html>
  );
}
