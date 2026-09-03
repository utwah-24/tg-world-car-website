/** Preserved for a future payment or invoice page; not used by checkout. */
export function BankDetailsCard() {
  return (
    <section className="bg-card rounded-none p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000]">
      <h2 className="mb-1 text-xl font-bold text-primary">Bank Details</h2>
      <p className="mb-5 text-sm text-muted-foreground">Use these details only when a TG World representative requests payment.</p>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {[["Account Name", "TG WORLD INTERNATIONAL LTD"], ["Bank Name", "NMB BANK"], ["Account No (TZS)", "42810004330"], ["Account No (USD)", "42810004331"], ["SWIFT Code", "NMIBTZTZXXX"], ["Address", "16860 Dar es Salaam"]].map(([label, value]) => (
          <div className="flex flex-col gap-0.5" key={label}><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><span className="font-semibold text-foreground">{value}</span></div>
        ))}
      </div>
    </section>
  )
}
