import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ContactDetails from "@/components/ContactDetails";
import RevealText from "@/components/RevealText";
import InstagramCard from "@/components/social/InstagramCard";
import GoogleReviewsCard from "@/components/social/GoogleReviewsCard";

export const metadata: Metadata = {
  title: "Contact — VB Photographe",
  description:
    "For weddings, bridal, groom, candid, baby and traditional shoots — write to vbphotograph2015@gmail.com.",
};

/**
 * Contact page.
 *
 * Heading + email use inline `clamp()` sizes rather than the site-wide
 * display tokens because they need to be:
 *   1. Smaller than the archive-style `text-display` so they never
 *      collide with the nav on tablet.
 *   2. Constrained so the email stays on a single line at desktop —
 *      splitting `vbphoto/graph2015/@gmail.com` down the address made
 *      it unreadable before.
 */
export default function ContactPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-40 md:px-10 md:pb-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="ui-label text-white/70">Say hello</p>

          <RevealText
            as="h1"
            splitBy="word"
            className="contact-heading mt-6 font-bold lowercase tracking-display text-white"
          >
            let's make something quiet together.
          </RevealText>

          <a
            href="mailto:vbphotograph2015@gmail.com"
            data-cursor-label="write"
            className="contact-email mt-8 block font-bold lowercase tracking-display text-white transition-opacity duration-500 hover:opacity-70"
            style={{
              lineHeight: 1.1,
              wordBreak: "normal",
              overflowWrap: "normal",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            vbphotograph2015@gmail.com
          </a>
        </div>
      </section>

      {/*
        Responsive heading + email sizes per Phase 6 spec — scoped to
        .contact-heading and .contact-email so these overrides can never
        leak into other pages.
          heading  mobile 2.5rem  · tablet 4rem   · desktop 5rem
          email    mobile 1.5rem  · tablet ~1.75rem · desktop 2rem
      */}
      <style>{`
        /* Phase 7 — smaller, tighter to prevent awkward line breaks. */
        .contact-heading { font-size: 2rem;   line-height: 1.05; }
        .contact-email   { font-size: 1.125rem; }
        @media (min-width: 640px) {
          .contact-heading { font-size: 3rem; }
          .contact-email   { font-size: 1.25rem; }
        }
        @media (min-width: 1024px) {
          .contact-heading { font-size: 4rem; }
          .contact-email   { font-size: 1.5rem; }
        }
      `}</style>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="ui-label text-white/70">Enquiries</p>
            <p className="mt-4 max-w-sm text-lg text-white/80">
              bridal, groom, candid films, baby shoots, pre-wedding and traditional ceremonies — all welcome. i answer within two days.
            </p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <ContactDetails
            eyebrow="Studio"
            heading={
              <>
                visit <span className="text-white/70">or call</span>
              </>
            }
          />
        </div>
      </section>

      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="ui-label text-white/70">Elsewhere</p>
          <h2
            className="mt-4 text-3xl font-bold lowercase tracking-display text-white md:text-4xl"
            style={{ lineHeight: 1.05 }}
          >
            find us <span className="text-white/70">online</span>
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            <InstagramCard />
            <GoogleReviewsCard />
          </div>
        </div>
      </section>
    </>
  );
}
