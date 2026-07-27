"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "index" },
  { href: "/work", label: "work" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
];

type Props = {
  /** Set from a server component that inspects the filesystem. */
  logoSrc?: string | null;
};

export default function Nav({ logoSrc = null }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Responsive nav-logo heights per spec — scoped so the class can
          never leak into other pages. */}
      <style>{`
        .nav-logo { height: 50px; }
        @media (min-width: 640px) { .nav-logo { height: 60px; } }
        @media (min-width: 1024px) { .nav-logo { height: 70px; } }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10 md:py-3">
          <Link
            href="/"
            className="ui-label group flex items-center gap-2"
            aria-label="VB Photographe — home"
          >
            {logoSrc ? (
              <>
                <Image
                  src={logoSrc}
                  alt="VB Photographe"
                  width={280}
                  height={140}
                  priority
                  quality={90}
                  className="nav-logo w-auto transition-transform duration-500 ease-expo group-hover:scale-105"
                  style={{
                    filter:
                      "drop-shadow(0 0 14px rgba(212, 175, 55, 0.28)) drop-shadow(0 0 4px rgba(212, 175, 55, 0.35))",
                  }}
                  draggable={false}
                />
                <span className="sr-only">VB Photographe — home</span>
              </>
            ) : (
              <>
                <span className="font-bold text-white">VB Photographe</span>
                <span className="ml-2 text-white/60">2015</span>
              </>
            )}
          </Link>

          {/* Desktop links */}
          <nav aria-label="Primary" className="hidden gap-8 md:flex">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor-label="open"
                  className="ui-label group relative"
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "text-white" : "text-white/70 transition-colors duration-500 group-hover:text-white"}>
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-expo group-hover:scale-x-100"
                    style={{
                      transform: active ? "scaleX(1)" : undefined,
                    }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            className="ui-label md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "close" : "menu"}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col items-start justify-center gap-4 bg-white px-8"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile primary" className="flex flex-col gap-2">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + i * 0.08,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className="text-gradient block text-6xl font-bold lowercase tracking-display"
                    style={{ lineHeight: 0.95 }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
