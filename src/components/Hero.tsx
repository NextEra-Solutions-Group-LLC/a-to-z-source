"use client";

import Image from "next/image";
import "@fontsource/poppins/600.css";
import {
  BrickWall,
  Building2,
  Cog,
  Cpu,
  Gem,
  HardHat,
  Truck,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import Globe from "./Globe";
import MemberPanel, { type PrivateData } from "./MemberPanel";

type Tab = "list" | "prices" | "communication";

type HeroProps = {
  data: PrivateData | null;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
};

// Listed clockwise from the top of the globe.
const CATEGORIES: { label: string; Icon: LucideIcon; image?: string }[] = [
  { label: "Electronics", Icon: Cpu },
  { label: "Exotic Countertop", Icon: Gem, image: "/icons/marble.png" },
  { label: "Food", Icon: Wheat },
  { label: "Manpower", Icon: HardHat },
  { label: "Real Estate", Icon: Building2 },
  { label: "Commercial Industrial Equipment", Icon: Cog },
  { label: "Local & Global Logistics", Icon: Truck },
  { label: "Building Materials", Icon: BrickWall },
];

const FLAGS = [
  { key: "us", name: "USA" },
  { key: "cn", name: "China" },
  { key: "in", name: "India" },
  { key: "gb", name: "UK" },
  { key: "au", name: "Australia" },
  { key: "ca", name: "Canada" },
  { key: "ae", name: "UAE" },
  { key: "jp", name: "Japan" },
  { key: "tr", name: "Turkey" },
];

export default function Hero({ data, activeTab, onSelectTab }: HeroProps) {
  return (
    // On desktop the hero fills exactly the space between navbar (128px) and footer (~32px), so the page never scrolls.
    <main className="relative overflow-hidden lg:h-[calc(100dvh-160px)]">
      {/* Soft background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_30%,rgba(18,48,79,0.07),transparent),radial-gradient(40%_40%_at_10%_90%,rgba(189,154,58,0.08),transparent)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:h-[calc(100dvh-160px)] lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:py-6">
        {/* Left: public intro, or the unlocked members area */}
        <div className="flex justify-center lg:justify-start">
          {data ? (
            <MemberPanel data={data} activeTab={activeTab} onSelectTab={onSelectTab} />
          ) : (
            <div className="max-w-xl">
              {/* Brand name in Poppins SemiBold */}
              <p
                style={{ fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif", fontWeight: 600 }}
                className="mb-3 text-3xl tracking-tight text-navy sm:text-4xl"
              >
                A to Z Source
              </p>
              <span className="inline-block rounded-md bg-gold px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-navy-deep">
                Members Only
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[clamp(2.25rem,6.4vh,3.75rem)]">
                Private Global Sourcing &amp; Procurement Network
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-navy/70">
                Access is strictly restricted to vetted members by existing member nomination only.
              </p>
            </div>
          )}
        </div>

        {/* Right: globe with category ring */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-full max-w-[560px] sm:aspect-square lg:w-[clamp(300px,calc(100dvh_-_220px),640px)] lg:max-w-none">
            <div className="mx-auto w-[78%] sm:absolute sm:left-1/2 sm:top-1/2 sm:w-[62%] sm:-translate-x-1/2 sm:-translate-y-1/2">
              <Globe />
            </div>

            {/* Orbiting categories (tablet and desktop) */}
            <ul className="absolute inset-0 hidden sm:block" aria-label="Sourcing categories">
              {CATEGORIES.map(({ label, Icon, image }, i) => {
                const angle = (-90 + i * 45) * (Math.PI / 180);
                const left = 50 + Math.cos(angle) * 44;
                const top = 50 + Math.sin(angle) * 44;
                return (
                  <li
                    key={label}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-navy shadow-[0_8px_20px_-10px_rgba(18,48,79,0.5)]">
                      {image ? (
                        <Image src={image} alt="" width={96} height={96} className="h-6 w-6 object-contain" />
                      ) : (
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="mt-1.5 text-[11px] font-semibold leading-tight text-navy/80">{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories for small screens */}
          <ul className="grid w-full max-w-md grid-cols-2 gap-2 sm:hidden" aria-label="Sourcing categories">
            {CATEGORIES.map(({ label, Icon, image }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy"
              >
                {image ? (
                  <Image src={image} alt="" width={64} height={64} className="h-4 w-4 shrink-0 object-contain" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                )}
                {label}
              </li>
            ))}
          </ul>

          {/* Country flags: shown here only below lg, on desktop they live in the navbar */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 rounded-full border border-slate-200 bg-white/90 px-5 py-2.5 shadow-[0_10px_30px_-16px_rgba(18,48,79,0.5)] lg:hidden">
            {FLAGS.map(({ key, name }) => (
              <Image
                key={key}
                src={`/flags/${key}.svg`}
                alt={name}
                title={name}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300"
              />
            ))}
            <span className="pl-1 text-sm font-medium text-navy/65">and growing</span>
          </div>
        </div>
      </div>
    </main>
  );
}