import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import RevealText from "@/components/RevealText";
import ProtectedImage from "@/components/gallery/ProtectedImage";
import InstagramCard from "@/components/social/InstagramCard";
import GoogleReviewsCard from "@/components/social/GoogleReviewsCard";
import { readFolder } from "@/lib/gallery";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact — VB Photographe",
  description:
    "For weddings, bridal, groom, candid, baby and traditional shoots — write to vbphotograph2015@gmail.com.",
};

/** Photograph glowing faintly behind the contact-information panel. */
const PANEL_PHOTO = { folder: "couple-portrait", file: "160.jpg" };

/**
 * Contact page — presentation only. The form itself (ContactForm, its
 * validation and the /api/contact request) is unchanged.
 *
 * Heading + email use scoped `clamp()`-style sizes rather than the
 * site-wide display tokens so the email always stays on one line at
 * desktop and never collides with the nav on tablet.
 */
export default function ContactPage() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single,
  )}`;
  const panelPhoto = readFolder(PANEL_PHOTO.folder, "images").find(
    (i) => i.file === PANEL_PHOTO.file,
  );

  return (
    <>
      <section className="px-6 pb-16 pt-36 md:px-10 md:pb-20 md:pt-44">
        <div className="mx-auto max-w-[1280px] text-center">
          <p className="eyebrow">Say hello</p>

          <RevealText
            as="h1"
            splitBy="word"
            className="contact-heading mx-auto mt-5 max-w-4xl font-serif font-medium tracking-serif text-ink"
          >
            Let&apos;s make something quiet together.
          </RevealText>

          <span aria-hidden className="gold-rule mx-auto mt-8" />

          <a
            href={`mailto:${SITE.email}`}
            data-cursor-label="write"
            className="contact-email mt-8 inline-block font-serif text-accent underline decoration-gold/40 underline-offset-8 transition-colors duration-500 hover:text-ink hover:decoration-gold"
            style={{
              lineHeight: 1.2,
              wordBreak: "normal",
              overflowWrap: "normal",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {SITE.email}
          </a>
        </div>
      </section>

      {/*
        Responsive heading + email sizes — scoped to .contact-heading and
        .contact-email so these overrides can never leak into other pages.
      */}
      <style>{`
        .contact-heading { font-size: 2.5rem;  line-height: 1.05; }
        .contact-email   { font-size: 1.25rem; }
        @media (min-width: 640px) {
          .contact-heading { font-size: 3.5rem; }
          .contact-email   { font-size: 1.5rem; }
        }
        @media (min-width: 1024px) {
          .contact-heading { font-size: 4.5rem; }
          .contact-email   { font-size: 1.75rem; }
        }
      `}</style>

      {/* Contact information + enquiry form — "Book Now" scrolls here */}
      <section
        id="enquiry"
        className="scroll-mt-28 px-6 pb-24 md:px-10 md:pb-32"
      >
        <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-12 lg:gap-8">
          {/* CONTACT INFORMATION */}
          <aside data-reveal className="theme-dark relative isolate overflow-hidden rounded-[28px] bg-noir p-8 shadow-lift ring-1 ring-gold/20 sm:p-10 lg:col-span-5">
            {panelPhoto && (
              <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.16]">
                <ProtectedImage
                  src={panelPhoto.thumb ?? panelPhoto.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
            )}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-b from-noir/40 via-noir/80 to-noir"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
            />
            <div aria-hidden className="film-grain absolute inset-0 -z-10" />

            <p className="eyebrow flex items-center gap-4">
              Contact information
              <span aria-hidden className="gold-rule w-10" />
            </p>
            <h2
              className="mt-5 font-serif text-[2.1rem] font-medium tracking-serif text-ink sm:text-[2.5rem]"
              style={{ lineHeight: 1.08 }}
            >
              Let&apos;s talk about your{" "}
              <em className="italic text-accent">celebration.</em>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              Bridal, groom, candid films, baby shoots, pre-wedding and traditional ceremonies — all welcome. I answer within two days.
            </p>

            <ul className="mt-10 space-y-7">
              <InfoRow icon="phone" label="Phone">
                {SITE.phones.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    data-cursor-label="call"
                    className="block font-serif text-2xl text-ink transition-colors duration-500 hover:text-accent"
                    style={{ lineHeight: 1.35 }}
                  >
                    {p}
                  </a>
                ))}
              </InfoRow>
              <InfoRow icon="mail" label="Email">
                <a
                  href={`mailto:${SITE.email}`}
                  data-cursor-label="write"
                  className="block break-all font-serif text-xl text-ink transition-colors duration-500 hover:text-accent sm:text-2xl"
                  style={{ lineHeight: 1.35 }}
                >
                  {SITE.email}
                </a>
              </InfoRow>
              <InfoRow icon="pin" label="Studio">
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="map"
                  className="block text-base text-ink/80 transition-colors duration-500 hover:text-ink"
                  style={{ lineHeight: 1.6 }}
                >
                  {SITE.address.lines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </a>
              </InfoRow>
            </ul>

            <div className="mt-10 border-t border-white/10 pt-7">
              <p className="ui-label text-[0.65rem] text-ink/50">Find us</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <SocialPill href={SITE.social.instagram.href} icon="instagram" external>
                  @{SITE.social.instagram.handle}
                </SocialPill>
                <SocialPill href={SITE.social.google.reviewHref} icon="star" external>
                  Google reviews
                </SocialPill>
                <SocialPill href={mapsHref} icon="pin" external>
                  Directions
                </SocialPill>
              </div>
            </div>
          </aside>

          {/* ENQUIRY FORM */}
          <div
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="relative rounded-[28px] border border-line/10 bg-card p-7 shadow-lift sm:p-10 md:p-12 lg:col-span-7"
          >
            <p className="eyebrow">Send a message</p>
            <h2
              className="mt-4 font-serif text-[2.1rem] font-medium tracking-serif text-ink sm:text-[2.5rem]"
              style={{ lineHeight: 1.08 }}
            >
              Tell us about <em className="italic text-accent">your day.</em>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/65">
              Share your date, venue and plans. Fields marked * are required.
            </p>
            <span aria-hidden className="gold-rule mt-7" />
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-alt px-6 py-24 md:px-10 md:py-28">
        <div data-reveal className="mx-auto max-w-[1280px]">
          <p className="eyebrow">Elsewhere</p>
          <h2
            className="mt-4 font-serif text-4xl font-medium tracking-serif text-ink md:text-5xl"
            style={{ lineHeight: 1.05 }}
          >
            Find us <em className="italic text-accent">online</em>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
            <InstagramCard />
            <GoogleReviewsCard />
          </div>
        </div>
      </section>
    </>
  );
}

type IconName = "phone" | "mail" | "pin" | "instagram" | "star";

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-accent">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="ui-label text-[0.65rem] text-ink/50">{label}</p>
        <div className="mt-1.5">{children}</div>
      </div>
    </li>
  );
}

function SocialPill({
  href,
  icon,
  external = false,
  children,
}: {
  href: string;
  icon: IconName;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      data-cursor-label="open"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-ink/85 transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-noir"
    >
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </a>
  );
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
      );
  }
}
