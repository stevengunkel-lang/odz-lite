export default function LiteLogo({ small = false }: { small?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={
          small
            ? "flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/10 text-xs font-black text-rose-100 shadow-xl shadow-rose-950/30"
            : "flex h-12 w-12 items-center justify-center rounded-[1.25rem] border border-rose-300/20 bg-rose-300/10 text-base font-black text-rose-100 shadow-2xl shadow-rose-950/40"
        }
      >
        ODZ.
      </div>

      <span
        className={
          small
            ? "text-xs font-black uppercase tracking-[0.18em] text-rose-100/55"
            : "text-sm font-black uppercase tracking-[0.2em] text-rose-100/55"
        }
      >
        Lite
      </span>
    </div>
  );
}