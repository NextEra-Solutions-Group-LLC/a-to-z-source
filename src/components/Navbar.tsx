"use client";

import Image from "next/image";
import { BadgeDollarSign, ListChecks, Lock, LogOut, MessageSquare } from "lucide-react";

type Tab = "list" | "prices" | "communication";

type NavbarProps = {
  member: string | null;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
  onLoginClick: (requested?: Tab) => void;
  onLogout: () => void;
};

// Order: List, Prices, Communication (stacked on the right, next to Member Login)
const NAV_ITEMS = [
  { id: "list" as const, label: "List", Icon: ListChecks },
  { id: "prices" as const, label: "Prices", Icon: BadgeDollarSign },
  { id: "communication" as const, label: "Communication", Icon: MessageSquare },
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

export default function Navbar({ member, activeTab, onSelectTab, onLoginClick, onLogout }: NavbarProps) {
  const unlocked = member !== null;

  return (
    // Tall header with a large logo; the bottom line sits well below the content
    <header className="sticky top-0 z-30 border-b border-slate-300 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between gap-4 px-5 sm:h-[128px] sm:px-8">
        <a href="/" aria-label="AtoZSource home" className="flex shrink-0 items-center">
          <Image
            src="/logo-full.png"
            alt="AtoZSource.com"
            width={1052}
            height={563}
            priority
            className="h-[76px] w-auto sm:h-[104px] lg:h-[116px]"
          />
        </a>

        {/* Country flags (desktop). On smaller screens they show inside the hero instead. */}
        <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-[0_10px_30px_-16px_rgba(18,48,79,0.5)] lg:flex">
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

        <div className="flex items-center gap-5">
          <nav aria-label="Members sections" className="hidden flex-col items-start gap-0.5 md:flex">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = unlocked && activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => (unlocked ? onSelectTab(id) : onLoginClick(id))}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors ${active ? "bg-navy text-white" : "text-navy/75 hover:bg-slate-100 hover:text-navy"
                    }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                  {!unlocked && <Lock className="h-3 w-3 text-gold" aria-label="Locked" />}
                </button>
              );
            })}
          </nav>

          {unlocked ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[160px] truncate text-sm text-navy/70 xl:inline">{member}</span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onLoginClick()}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-navy bg-white px-4 py-2 text-sm font-semibold text-navy shadow-[0_0_0_3px_rgba(189,154,58,0.35)] transition-colors hover:bg-navy hover:text-white"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Member Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile section links (the stacked menu is hidden below md) */}
      <nav aria-label="Members sections" className="grid grid-cols-3 gap-1 border-t border-slate-200 px-3 py-1.5 md:hidden">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = unlocked && activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => (unlocked ? onSelectTab(id) : onLoginClick(id))}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 py-1.5 text-[11px] font-medium transition-colors ${active ? "bg-navy text-white" : "text-navy/75 hover:bg-slate-100"
                }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
              {!unlocked && <Lock className="h-3 w-3 text-gold" aria-label="Locked" />}
            </button>
          );
        })}
      </nav>
    </header>
  );
}