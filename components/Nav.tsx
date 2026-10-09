"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useLenis } from "@/components/SmoothScroll";

type NavLink = { href: string; label: string };

/**
 * "Services" points at the "What we do" section of About rather than its
 * own route; a scroll-spy hands the active indicator from About to
 * Services while that section is on screen.
 */
const LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/about#services", label: "Services" },
  { href: "/work", label: "Gallery" },
  { href: "/packages", label: "Packages" },
  { href: "/contact", label: "Contact" },
];

const BOOK_HREF = "/contact";
/** Already on /contact, Book Now glides down to the form instead. */
const BOOK_SECTION_ID = "enquiry";
const SERVICES_ID = "services";
/**
 * Full bar from 650px up (laptops, desktops, tablets, wide browser
 * windows); below that the links move into the menu. Mirrored in the
 * scoped <style> below.
 */
const DESKTOP_QUERY = "(min-width: 650px)";
const EASE = [0.76, 0, 0.24, 1] as const;
/** Where the menu's circular reveal grows from — the menu button. */
const REVEAL_ORIGIN = "calc(100% - 38px) 34px";

type Props = {
  /** Set from a server component that inspects the filesystem. */
  logoSrc?: string | null;
  /** Shown at the foot of the mobile menu. */
  contact?: {
    phone: string;
    instagram: { handle: string; href: string };
    location: string;
  } | null;
};

function splitHref(href: string) {
  const [path, hash = ""] = href.split("#");
  return { path, hash };
}

export default function Nav({ logoSrc = null, contact = null }: Props) {
  const pathname = usePathname();
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [inServices, setInServices] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy for the Services anchor on /about. The section may mount a
  // frame or two after the route change, so retry briefly until it exists.
  useEffect(() => {
    setInServices(false);
    if (pathname !== "/about") return;

    let observer: IntersectionObserver | undefined;
    let rafId = 0;
    let tries = 0;
    const attach = () => {
      const el = document.getElementById(SERVICES_ID);
      if (!el) {
        if (tries++ < 30) rafId = requestAnimationFrame(attach);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setInServices(entry.isIntersecting),
        // A thin band just above the middle of the viewport.
        { rootMargin: "-40% 0px -55% 0px" },
      );
      observer.observe(el);
    };
    attach();

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [pathname]);

  // While the mobile menu is open: freeze the page behind it, close on
  // Escape or when the window widens to the full bar, and keep Tab inside
  // the bar + menu. Focus returns to the toggle when it closes.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    lenis?.stop();

    const focusables = () =>
      [headerRef.current, menuRef.current].flatMap((el) =>
        el
          ? Array.from(
              el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
            ).filter((n) => n.getClientRects().length > 0)
          : [],
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const mq = window.matchMedia(DESKTOP_QUERY);
    const onViewport = () => mq.matches && setOpen(false);

    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onViewport);
    const focusTimer = window.setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus({
        preventScroll: true,
      });
    }, 250);

    const toggle = toggleRef.current;
    const menu = menuRef.current;
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onViewport);
      root.style.overflow = prevOverflow;
      lenis?.start();
      if (menu?.contains(document.activeElement)) {
        toggle?.focus({ preventScroll: true });
      }
    };
  }, [open, lenis]);

  const isActive = (href: string) => {
    const { path, hash } = splitHref(href);
    if (path === "/about") {
      return pathname === "/about" && (hash ? inServices : !inServices);
    }
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  const scrollToTarget = useCallback(
    (target: HTMLElement | null) => {
      const immediate = Boolean(reduceMotion);
      if (lenis) {
        lenis.start();
        // Lenis honours the target's scroll-margin-top, which clears the bar.
        lenis.scrollTo(target ?? 0, { immediate, force: true });
        return;
      }
      if (target) {
        target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
      }
    },
    [lenis, reduceMotion],
  );

  /**
   * Links to another route are left to Next. A link to the page you are
   * already on glides instead: to its #section, or back to the top.
   */
  const onNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
    sectionId?: string,
  ) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const { path, hash } = splitHref(href);
    if (path !== pathname) return;

    e.preventDefault();
    setOpen(false);
    const id = hash || sectionId;
    scrollToTarget(id ? document.getElementById(id) : null);
    window.history.replaceState(
      window.history.state,
      "",
      hash ? `${path}#${hash}` : path,
    );
  };

  // Transparent only while sitting over the dark home hero; light pages
  // start on a nearly solid bar so white links stay legible, and every
  // page settles on the solid, slimmer bar once scrolled.
  const overHero = pathname === "/" && !scrolled;
  const barTone = open
    ? "border-transparent bg-transparent"
    : scrolled
      ? "border-white/10 bg-noir/[0.97] shadow-[0_14px_34px_-22px_rgba(0,0,0,0.75)] backdrop-blur-md"
      : overHero
        ? "border-transparent bg-transparent"
        : "border-white/[0.06] bg-noir/[0.93] backdrop-blur-md";
  const compact = scrolled && !open;

  const indicatorTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 34 };

  const panel: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        hidden: { clipPath: `circle(0% at ${REVEAL_ORIGIN})` },
        show: {
          clipPath: `circle(150% at ${REVEAL_ORIGIN})`,
          transition: {
            duration: 0.75,
            ease: EASE,
            delayChildren: 0.18,
            staggerChildren: 0.06,
          },
        },
        exit: {
          clipPath: `circle(0% at ${REVEAL_ORIGIN})`,
          transition: { duration: 0.6, ease: EASE },
        },
      };

  const item: Variants = reduceMotion
    ? { hidden: {}, show: {}, exit: {} }
    : {
        hidden: { y: 28, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };

  return (
    <>
      {/* Logo + link sizing (px, so enlarged browser text can't push the
          links into the logo) and the 650px menu/full-bar switch — scoped
          so the classes can never leak into other pages. */}
      <style>{`
        .nav-logo { height: 36px; transition: height 500ms var(--ease-expo); }
        .nav-compact .nav-logo { height: 30px; }
        .nav-book.btn { padding: 10px 18px; font-size: 13px; }
        .nav-link { --pad: 5px; padding: 10px var(--pad); font-size: 13.5px; }
        .nav-line { left: var(--pad); right: var(--pad); }
        .nav-desktop-only { display: none; }
        @keyframes nav-enter { from { transform: translateY(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
        .nav-enter { animation: nav-enter 900ms var(--ease-expo) both; }
        @media (prefers-reduced-motion: reduce) { .nav-enter { animation: none; } }
        @media (min-width: 375px) {
          .nav-logo { height: 40px; }
          .nav-compact .nav-logo { height: 32px; }
        }
        @media (min-width: 650px) {
          .nav-desktop-only { display: block; }
          .nav-mobile-only { display: none !important; }
        }
        @media (min-width: 768px) {
          .nav-logo { height: 44px; }
          .nav-compact .nav-logo { height: 36px; }
          .nav-link { --pad: 8px; font-size: 14.5px; }
          .nav-book.btn { padding: 11px 22px; font-size: 14px; }
        }
        @media (min-width: 1024px) {
          .nav-logo { height: 54px; }
          .nav-compact .nav-logo { height: 42px; }
          .nav-link { --pad: 12px; font-size: 15.5px; letter-spacing: 0.02em; }
          .nav-book.btn { padding: 13px 28px; font-size: 15px; }
        }
        @media (min-width: 1280px) {
          .nav-logo { height: 60px; }
          .nav-compact .nav-logo { height: 46px; }
          .nav-link { --pad: 18px; font-size: 16.5px; }
          .nav-book.btn { padding: 14px 32px; font-size: 16px; }
        }
        @media (min-width: 1536px) {
          .nav-logo { height: 64px; }
          .nav-link { --pad: 20px; font-size: 17.5px; }
          .nav-book.btn { padding: 15px 34px; font-size: 16.5px; }
        }
      `}</style>

      <header
        ref={headerRef}
        className={`nav-enter theme-dark fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-700 ease-expo ${barTone} ${
          compact ? "nav-compact" : ""
        }`}
      >
        {/* Soft shade over the hero photo so the links read on any slide */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-700 ${
            overHero && !open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`relative mx-auto flex max-w-[1440px] items-center justify-between gap-x-[12px] px-[16px] transition-[padding] duration-500 ease-expo sm:px-[20px] min-[650px]:gap-x-[14px] md:gap-x-[20px] md:px-[32px] lg:gap-x-[32px] lg:px-[40px] ${
            compact ? "py-[8px] lg:py-[10px]" : "py-[12px] lg:py-[16px]"
          }`}
        >
          <Link
            href="/"
            onClick={(e) => onNavClick(e, "/")}
            className="group flex shrink-0 items-center"
            aria-label="VB Photographe — home"
          >
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt=""
                width={441}
                height={220}
                priority
                className="nav-logo w-auto transition-transform duration-500 ease-expo group-hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 0 12px rgba(212, 175, 55, 0.25)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.3))",
                }}
                draggable={false}
              />
            ) : (
              <span className="font-serif text-[24px] text-white">VB Photographe</span>
            )}
          </Link>

          {/* Full bar links (650px and up) */}
          <nav aria-label="Primary" className="nav-desktop-only flex-1">
            <ul className="flex items-center justify-center gap-[2px] xl:gap-[8px]">
              {LINKS.map((link) => {
                const active = isActive(link.href);
                const { hash } = splitHref(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => onNavClick(e, link.href)}
                      data-cursor-label="open"
                      aria-current={
                        active ? (hash ? "location" : "page") : undefined
                      }
                      className="nav-link group relative block whitespace-nowrap font-medium leading-none"
                    >
                      <span
                        className={`transition-colors duration-500 ${
                          active
                            ? "text-gold"
                            : "text-white/75 group-hover:text-white"
                        }`}
                      >
                        {link.label}
                      </span>

                      {/* Hover hint */}
                      {!active && (
                        <span
                          aria-hidden
                          className="nav-line absolute bottom-[2px] h-px origin-left scale-x-0 bg-white/35 transition-transform duration-500 ease-expo group-hover:scale-x-100"
                        />
                      )}

                      {/* Active indicator — glides between links */}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          aria-hidden
                          className="nav-line absolute bottom-[2px] h-[1.5px] rounded-full bg-gold"
                          transition={indicatorTransition}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-[10px]">
            <Link
              href={BOOK_HREF}
              onClick={(e) => onNavClick(e, BOOK_HREF, BOOK_SECTION_ID)}
              data-cursor-label="book"
              className="nav-book btn btn-gold"
            >
              Book Now
            </Link>

            {/* Menu button (below 650px) */}
            <button
              ref={toggleRef}
              type="button"
              className="nav-mobile-only group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-500 hover:border-gold/60"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden className="relative block h-[13px] w-5">
                <span
                  className={`absolute left-0 top-0 h-px w-5 bg-gold transition-transform duration-500 ease-expo ${
                    open ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute right-0 top-[6px] h-px bg-gold transition-all duration-500 ease-expo ${
                    open ? "w-0 opacity-0" : "w-3 group-hover:w-5"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[12px] h-px w-5 bg-gold transition-transform duration-500 ease-expo ${
                    open ? "-translate-y-[6px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            data-lenis-prevent
            className="nav-mobile-only theme-dark fixed inset-0 z-[45] flex flex-col overflow-y-auto overflow-x-hidden bg-noir px-6 pb-8 pt-24 sm:px-10"
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* Faint gold glow behind the list */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl"
            />

            <motion.p variants={item} className="eyebrow relative">
              Menu
            </motion.p>

            <nav aria-label="Mobile primary" className="relative mt-4">
              <ul>
                {LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  const { hash } = splitHref(link.href);
                  return (
                    <motion.li
                      key={link.href}
                      variants={item}
                      className="border-b border-white/10"
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => onNavClick(e, link.href)}
                        aria-current={
                          active ? (hash ? "location" : "page") : undefined
                        }
                        className="group flex items-center gap-5 py-3.5 sm:py-4"
                      >
                        <span className="w-6 font-sans text-[0.68rem] font-semibold tracking-ui text-gold/60">
                          0{i + 1}
                        </span>
                        <span
                          className={`font-serif text-[2.15rem] font-medium leading-none tracking-serif transition-colors duration-500 sm:text-5xl ${
                            active
                              ? "italic text-gold"
                              : "text-white group-hover:text-gold-light"
                          }`}
                        >
                          {link.label}
                        </span>
                        <span aria-hidden className="ml-auto">
                          {active ? (
                            <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
                          ) : (
                            <svg
                              viewBox="0 0 16 16"
                              className="h-4 w-4 text-white/30 transition-all duration-500 ease-expo group-hover:translate-x-1 group-hover:text-gold"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.4"
                            >
                              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <motion.div variants={item} className="relative mt-auto pt-10">
              <Link
                href={BOOK_HREF}
                onClick={(e) => onNavClick(e, BOOK_HREF, BOOK_SECTION_ID)}
                className="btn btn-gold w-full py-4"
              >
                Book Now
              </Link>

              {contact && (
                <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm">
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="text-white/70 transition-colors duration-500 hover:text-gold"
                  >
                    {contact.phone}
                  </a>
                  <a
                    href={contact.instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 transition-colors duration-500 hover:text-gold"
                  >
                    @{contact.instagram.handle}
                  </a>
                  <span className="ui-label text-white/40">
                    {contact.location}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
