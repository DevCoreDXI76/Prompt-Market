import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface ShowcaseCard {
  category: string;
  rating: string;
  title: string;
  price: string;
  bg: string;
  text: string;
  badge: string;
  content: ReactNode;
}

const showcaseTrack1: ShowcaseCard[] = [
  {
    category: "Midjourney",
    rating: "4.7",
    title: "Beautiful Portraits",
    price: "$1.99",
    bg: "bg-slate-900 border border-slate-800",
    text: "text-slate-100",
    badge: "bg-indigo-950/60 text-indigo-300 border-indigo-500/20",
    content: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 ring-2 ring-slate-800" />
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 ring-2 ring-slate-800 -ml-4" />
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 ring-2 ring-slate-800 -ml-4" />
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "5.0",
    title: "Primary Colors Logos",
    price: "$1.99",
    bg: "bg-white border border-slate-200",
    text: "text-slate-800",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    content: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center text-white text-xs shadow-md">🦋</div>
        <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs shadow-md">🚲</div>
        <div className="h-8 w-8 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-800 text-xs shadow-md">🌳</div>
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "4.8",
    title: "Caricature Drawings",
    price: "$2.49",
    bg: "bg-slate-900 border border-slate-800",
    text: "text-slate-100",
    badge: "bg-indigo-950/60 text-indigo-300 border-indigo-500/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 to-pink-500 flex items-center justify-center text-base shadow-lg">🤪</div>
      </div>
    ),
  },
  {
    category: "Claude",
    rating: "4.9",
    title: "Python Code Generator",
    price: "$3.99",
    bg: "bg-slate-900 border border-slate-800",
    text: "text-slate-100",
    badge: "bg-orange-950/60 text-orange-300 border-orange-500/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-20 rounded-md bg-slate-950 border border-slate-800 p-1 font-mono text-[6px] text-emerald-400 flex flex-col justify-between">
          <div className="flex items-center gap-0.5 border-b border-slate-900 pb-0.5 mb-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className="w-1 h-1 rounded-full bg-yellow-500" />
            <span className="w-1 h-1 rounded-full bg-green-500" />
          </div>
          <div>def main():</div>
          <div className="pl-1.5">print(&quot;Hi&quot;)</div>
        </div>
      </div>
    ),
  },
];

const showcaseTrack2: ShowcaseCard[] = [
  {
    category: "Midjourney",
    rating: "5.0",
    title: "Primary Colors Illustrations",
    price: "$1.99",
    bg: "bg-indigo-600",
    text: "text-white",
    badge: "bg-white/20 text-white border-white/20",
    content: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="h-10 w-14 rounded-lg bg-gradient-to-tr from-yellow-300 via-pink-400 to-indigo-500 shadow-md rotate-[-6deg]" />
        <div className="h-10 w-14 rounded-lg bg-gradient-to-tr from-green-300 via-blue-400 to-purple-500 shadow-md rotate-[6deg] -ml-5" />
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "5.0",
    title: "Lineal Color Icons",
    price: "$3.99",
    bg: "bg-white border border-slate-200",
    text: "text-slate-800",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    content: (
      <div className="flex items-center justify-center gap-2 h-full">
        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm">🍔</div>
        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm">🚀</div>
        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm">🤖</div>
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "4.6",
    title: "Brand Models",
    price: "$1.99",
    bg: "bg-slate-900 border border-slate-800",
    text: "text-slate-100",
    badge: "bg-indigo-950/60 text-indigo-300 border-indigo-500/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="relative h-10 w-20 rounded bg-slate-800 overflow-hidden border border-slate-700 flex gap-0.5 p-0.5">
          <div className="flex-1 bg-gradient-to-b from-slate-600 to-slate-700 rounded" />
          <div className="flex-1 bg-gradient-to-b from-slate-500 to-slate-700 rounded" />
        </div>
      </div>
    ),
  },
  {
    category: "GPT-3",
    rating: "4.8",
    title: "LinkedIn Post Generator",
    price: "$2.99",
    bg: "bg-sky-500",
    text: "text-white",
    badge: "bg-white/25 text-white border-white/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-xl bg-white text-sky-500 flex items-center justify-center text-lg font-black shadow-md">in</div>
      </div>
    ),
  },
];

const showcaseTrack3: ShowcaseCard[] = [
  {
    category: "DALL-E",
    rating: "4.7",
    title: "Iconic Illustration",
    price: "$2.99",
    bg: "bg-slate-900 border border-slate-800",
    text: "text-slate-100",
    badge: "bg-purple-950/60 text-purple-300 border-purple-500/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 shadow-lg flex items-center justify-center text-xs text-white">✨</div>
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "5.0",
    title: "Website Mockups",
    price: "$1.99",
    bg: "bg-white border border-slate-200",
    text: "text-slate-800",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    content: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="h-10 w-12 rounded border border-slate-100 bg-slate-50 p-0.5 flex flex-col gap-0.5 shadow-xs">
          <div className="h-1 w-full bg-slate-200 rounded" />
          <div className="grid grid-cols-2 gap-0.5 flex-1">
            <div className="bg-slate-100 rounded" />
            <div className="bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-10 w-12 rounded border border-slate-100 bg-slate-50 p-0.5 flex flex-col gap-0.5 shadow-xs">
          <div className="h-1 w-4 bg-indigo-500 rounded" />
          <div className="h-2 w-full bg-slate-100 rounded" />
          <div className="h-2 w-full bg-slate-100 rounded" />
        </div>
      </div>
    ),
  },
  {
    category: "GPT-3",
    rating: "4.9",
    title: "Audience Finder For Marketing",
    price: "$3.99",
    bg: "bg-amber-500",
    text: "text-slate-900",
    badge: "bg-black/10 text-slate-900 border-black/10",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-sm shadow-md">👤</div>
      </div>
    ),
  },
  {
    category: "GPT-3",
    rating: "4.8",
    title: "Powerful Midjourney Prompt...",
    price: "$3.99",
    bg: "bg-rose-600",
    text: "text-white",
    badge: "bg-white/20 text-white border-white/20",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-lg shadow-inner">💡</div>
      </div>
    ),
  },
  {
    category: "GPT-3",
    rating: "5.0",
    title: "Writing Assistant",
    price: "$4.99",
    bg: "bg-emerald-400",
    text: "text-slate-950",
    badge: "bg-black/15 text-slate-950 border-black/10",
    content: (
      <div className="flex items-center justify-center h-full">
        <div className="h-10 w-10 rounded-full bg-white text-emerald-600 flex items-center justify-center text-sm shadow-md font-bold">✍️</div>
      </div>
    ),
  },
  {
    category: "Midjourney",
    rating: "5.0",
    title: "3D Buildings Game Assets",
    price: "$1.99",
    bg: "bg-white border border-slate-200",
    text: "text-slate-800",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    content: (
      <div className="flex items-center justify-center gap-1 h-full">
        <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center text-xs">🏰</div>
        <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center text-xs">🏢</div>
      </div>
    ),
  },
];

const track1 = [...showcaseTrack1, ...showcaseTrack1, ...showcaseTrack1];
const track2 = [...showcaseTrack2, ...showcaseTrack2, ...showcaseTrack2];
const track3 = [...showcaseTrack3, ...showcaseTrack3, ...showcaseTrack3];

function renderShowcaseCard(card: ShowcaseCard, idx: number, keyPrefix: string) {
  const isLight = card.bg.includes("white");
  return (
    <div
      key={`${keyPrefix}-${idx}`}
      className={`inline-flex flex-col justify-between p-3.5 rounded-2xl w-52 h-36 shrink-0 select-none shadow-lg transition-all ${card.bg}`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className={`px-2 py-0.5 rounded-md border ${card.badge}`}>{card.category}</span>
        {card.rating && (
          <span className="flex items-center gap-0.5 text-amber-400">★ {card.rating}</span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center my-1.5">{card.content}</div>
      <div className={`flex items-center justify-between gap-1 mt-auto pt-1.5 border-t ${isLight ? "border-slate-100" : "border-slate-800"} text-[10px]`}>
        <span className={`font-bold truncate max-w-[130px] ${card.text}`}>{card.title}</span>
        <span className={`font-semibold shrink-0 px-1.5 py-0.5 rounded ${isLight ? "bg-slate-100 text-slate-800" : "bg-white/10 text-white"}`}>{card.price}</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("HeroSection");

  return (
    <section id="hero-section" className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 sm:px-12 lg:py-10 text-white shadow-2xl mb-12 border border-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(99,102,241,0.25),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(79,70,229,0.15),transparent_55%)] pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-5">
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-indigo-400 border border-slate-800 animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("badge")}</span>
          </div>

          <h1
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.2] text-white animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {t("title1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
              {t("title2")}
            </span>
          </h1>

          <p
            className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t("description")}
          </p>

          <div className="pt-1 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link
              id="hero-browse-prompts-btn"
              href="/prompts"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
            >
              <span>{t("cta")}</span>
              <Sparkles className="h-4 w-4 text-indigo-200" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 relative h-[200px] sm:h-[280px] lg:h-[340px] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute w-[150%] min-w-[850px] h-[480px] [perspective:1400px] pointer-events-none select-none">
            <div
              className="w-full h-full flex flex-col gap-3 justify-center origin-center"
              style={{
                transform: "rotateX(13deg) rotateY(-22deg) rotateZ(3deg) scale(0.82)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex gap-4 animate-marquee-slow whitespace-nowrap pl-[10%]">
                {track1.map((card, i) => renderShowcaseCard(card, i, "t1"))}
              </div>
              <div className="flex gap-4 animate-marquee-reverse-slow whitespace-nowrap -ml-[20%]">
                {track2.map((card, i) => renderShowcaseCard(card, i, "t2"))}
              </div>
              <div className="flex gap-4 animate-marquee-slow whitespace-nowrap pl-[0%]">
                {track3.map((card, i) => renderShowcaseCard(card, i, "t3"))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1/6 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
