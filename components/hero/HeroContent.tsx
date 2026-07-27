import RevealText from "@/components/RevealText";
import HeroButtons from "./HeroButtons";

/**
 * All text content of the hero section — eyebrow, wordmark, description.
 * Kept separate from the 3D scene and CTAs so each piece is testable
 * and reusable on other landing surfaces.
 */
export default function HeroContent() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col">
      <p className="ui-label text-white/70">
        Photographer &nbsp;·&nbsp; Salem, India &nbsp;·&nbsp; VB Photographe 2015
      </p>

      <h1
        className="wordmark-xl mt-6 font-bold lowercase tracking-display text-white md:mt-8"
        style={{ lineHeight: 0.85 }}
      >
        <RevealText as="span" splitBy="word" className="block">
          vb
        </RevealText>
        <RevealText
          as="span"
          splitBy="word"
          delay={0.15}
          className="block text-white/80"
        >
          photographe
        </RevealText>
      </h1>

      <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2 md:gap-16">
        <RevealText
          as="p"
          splitBy="word"
          delay={0.35}
          className="max-w-lg text-lg text-white/85 md:text-xl"
        >
          photographs that hold their breath — bridal, groom and candid stories for the couples, families and people who prefer quiet to loud.
        </RevealText>

        <HeroButtons />
      </div>
    </div>
  );
}
