import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`} {...props}>{children}</section>;
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pt-5 ${className}`} {...props}>{children}</div>;
}

export function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pb-5 ${className}`} {...props}>{children}</div>;
}

export function Button({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "green" | "amber" | "blue" | "rose"; children: ReactNode }) {
  const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", rose: "bg-rose-50 text-rose-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  return <div className="mb-6"><p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-slate-400">{eyebrow}</p><h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>;
}

export function LoadingBlock({ label = "Loading secure data…" }: { label?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">{label}</div>;
}

export function ErrorBlock() {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Unable to load this secure dataset. Check your session or contact an administrator.</div>;
}
