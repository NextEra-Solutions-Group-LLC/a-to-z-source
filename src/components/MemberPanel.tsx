"use client";

import {
  BadgeDollarSign,
  BrickWall,
  Building2,
  Cog,
  Cpu,
  Gem,
  HardHat,
  ListChecks,
  LockOpen,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Truck,
  Wheat,
  type LucideIcon,
} from "lucide-react";

type Tab = "list" | "prices" | "communication";

export type PrivateData = {
  catalog: {
    category: string;
    items: { name: string; origin: string; unit: string; price: string }[];
  }[];
  contact: { phone: string; email: string };
};

type MemberPanelProps = {
  data: PrivateData;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
};

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "list", label: "List", Icon: ListChecks },
  { id: "prices", label: "Prices", Icon: BadgeDollarSign },
  { id: "communication", label: "Communication", Icon: MessageSquare },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Electronics: Cpu,
  "Exotic Countertop": Gem,
  Food: Wheat,
  Manpower: HardHat,
  "Real Estate": Building2,
  "Commercial Industrial Equipment": Cog,
  "Local & Global Logistics": Truck,
  "Building Materials": BrickWall,
};

export default function MemberPanel({ data, activeTab, onSelectTab }: MemberPanelProps) {
  const phoneDigits = data.contact.phone.replace(/\D/g, "");

  return (
    <section
      aria-label="Members area"
      className="animate-fade-in w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-28px_rgba(18,48,79,0.35)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-soft text-gold">
            <LockOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy">Members Area</p>
            <p className="text-xs text-navy/55">All private content unlocked</p>
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Members content" className="flex gap-1 border-b border-slate-200 px-3 pt-3">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onSelectTab(id)}
              className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                active ? "border-gold text-navy" : "border-transparent text-navy/55 hover:text-navy"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="max-h-[calc(100dvh-340px)] min-h-[260px] overflow-y-auto px-5 py-5">
        {activeTab === "list" && (
          <div className="space-y-5">
            {data.catalog.map((group) => {
              const Icon = CATEGORY_ICONS[group.category] ?? ListChecks;
              return (
                <div key={group.category}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-navy">
                    <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                    {group.category}
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {group.items.map((item) => (
                      <li key={item.name} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                        <span className="text-navy">{item.name}</span>
                        <span className="shrink-0 text-xs font-medium text-navy/55">{item.origin}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "prices" && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-navy/55">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Item</th>
                  <th className="px-3.5 py-2.5 font-semibold">Unit</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.catalog.flatMap((group) => [
                  <tr key={`${group.category}-head`} className="bg-gold-soft/60">
                    <td colSpan={3} className="px-3.5 py-1.5 text-xs font-bold text-navy">
                      {group.category}
                    </td>
                  </tr>,
                  ...group.items.map((item) => (
                    <tr key={`${group.category}-${item.name}`}>
                      <td className="px-3.5 py-2.5 text-navy">{item.name}</td>
                      <td className="px-3.5 py-2.5 text-navy/60">{item.unit}</td>
                      <td className="px-3.5 py-2.5 text-right font-semibold text-navy">{item.price}</td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "communication" && (
          <div className="space-y-3">
            <a
              href={`tel:${data.contact.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-gold hover:bg-gold-soft/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-medium uppercase tracking-wide text-navy/50">Phone</span>
                <span className="block text-base font-bold text-navy">{data.contact.phone}</span>
              </span>
            </a>

            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-gold hover:bg-gold-soft/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-medium uppercase tracking-wide text-navy/50">WhatsApp</span>
                <span className="block text-base font-bold text-navy">{data.contact.phone}</span>
              </span>
            </a>

            <a
              href={`mailto:${data.contact.email}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-gold hover:bg-gold-soft/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-medium uppercase tracking-wide text-navy/50">Email</span>
                <span className="block text-base font-bold text-navy">{data.contact.email}</span>
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
