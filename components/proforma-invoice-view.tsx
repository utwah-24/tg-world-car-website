import type { ProformaInvoicePayload } from "@/lib/proforma-types"
import { PROFORMA_BANK, PROFORMA_COMPANY } from "@/lib/proforma-company"
import { formatInvoiceDateDisplay } from "@/lib/proforma-utils"
import { proformaCarImageSrcForCapture } from "@/lib/proforma-image-url"

const ink = "text-[#152a45]"
const inkMuted = "text-[#1e3a5f]"
const red = "text-[#b4232c]"
function lineVehicleTitle(car: ProformaInvoicePayload["car"]): string {
  const y = car.year ? `${car.year} ` : ""
  return `${y}${car.name}`.toUpperCase()
}

function formatAmount(price: string): string {
  const p = price.trim()
  if (/^sh\s/i.test(p)) return p
  return `SH ${p}`
}

function formatDeliveryLines(d: ProformaInvoicePayload["delivery"]): string {
  const line1 = d.address.trim()
  const cityRegion = [d.city.trim(), d.region.trim()].filter(Boolean).join(", ")
  const parts: string[] = []
  if (line1) parts.push(line1)
  if (cityRegion) parts.push(cityRegion)
  if (parts.length === 0) return "—"
  return `${parts.join("\n")}\nTANZANIA`
}

export function ProformaInvoiceView({ data }: { data: ProformaInvoicePayload }) {
  const vehicleLine = lineVehicleTitle(data.car)
  const color = (data.car.color || "—").toUpperCase()
  const deliveryBlock = formatDeliveryLines(data.delivery)
  const carImageSrc = proformaCarImageSrcForCapture(data.car.image)

  return (
    <div className="bg-white text-black shadow-sm print:shadow-none">
      {/* Top row */}
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <h1 className={`text-2xl font-bold tracking-wide sm:text-3xl ${inkMuted}`}>
            PROFORMA INVOICE
          </h1>
          <div className="mt-6 space-y-1 text-sm leading-relaxed">
            <p className="text-base font-bold text-black">{PROFORMA_COMPANY.legalName}</p>
            <p className={`text-xs font-semibold tracking-wider ${ink}`}>{PROFORMA_COMPANY.tagline}</p>
            <p className="text-sm">Phone: {PROFORMA_COMPANY.phone}</p>
            <p className="text-sm">Web: {PROFORMA_COMPANY.web}</p>
            <p className="text-sm">Mail: {PROFORMA_COMPANY.email}</p>
            <p className="text-sm">P.O Box: {PROFORMA_COMPANY.poBox}</p>
            <p className="text-sm">Location: {PROFORMA_COMPANY.location}</p>
          </div>
        </div>
        <div className="flex shrink-0 justify-start sm:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset for print/PDF capture */}
          <img
            src="/tg-world-logo-proforma.png"
            alt="TG World International"
            className="h-16 w-auto max-w-[200px] object-contain object-right sm:h-20"
            width={200}
            height={80}
          />
        </div>
      </div>

      {/* Meta + Sent to */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="bg-[#3d6ea8] px-3 py-2">
            <span className="text-sm font-bold tracking-wide text-white">SENT TO</span>
          </div>
          <div className="mt-3 space-y-1 border-t border-red-600/80 pt-3 text-sm">
            <p className="font-semibold text-black">{data.buyer.fullName}</p>
            <p>
              <span className="font-medium">P.O BOX: </span>
              {data.delivery.postalCode || "—"}
            </p>
            <p>
              <span className="font-medium">PHONE: </span>
              {data.buyer.phone}
            </p>
            <p>
              <span className="font-medium">EMAIL: </span>
              {data.buyer.email}
            </p>
            <p className="font-medium">Address</p>
            <p className="whitespace-pre-line text-black/90">{deliveryBlock}</p>
            {data.additionalInfo ? (
              <p className="mt-3 border-t border-neutral-200 pt-3 text-sm text-black/80">
                <span className="font-medium">Note: </span>
                {data.additionalInfo}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 text-sm lg:text-right">
          <p>
            <span className={`font-bold ${inkMuted}`}>INVOICE #: </span>
            <span className="text-black">{data.invoiceNo}</span>
          </p>
          <p>
            <span className={`font-bold ${inkMuted}`}>INVOICE DATE: </span>
            <span className="text-black">{formatInvoiceDateDisplay(data.invoiceDate)}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-10">
        <div className="h-px w-full bg-red-600" />
        <div className={`grid grid-cols-[1fr_auto] gap-4 py-3 text-sm font-bold ${inkMuted}`}>
          <span>DESCRIPTION</span>
          <span className="text-right">AMOUNT</span>
        </div>
        <div className="h-px w-full bg-red-600" />

        <div className="grid grid-cols-[1fr_auto] gap-4 py-6 text-sm">
          <div className="space-y-3 leading-relaxed sm:flex sm:gap-5">
            {carImageSrc ? (
              <div className="shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 sm:w-[220px]">
                {/* Same-origin proxy for API images so html2canvas includes the photo in PDFs */}
                {/* eslint-disable-next-line @next/next/no-img-element -- print/PDF capture */}
                <img
                  src={carImageSrc}
                  alt=""
                  className="aspect-[4/3] w-full object-cover sm:aspect-[3/2] sm:h-[147px] sm:w-[220px]"
                  width={220}
                  height={147}
                />
              </div>
            ) : null}
            <div className="min-w-0 space-y-2">
              <p className="font-semibold text-black">{vehicleLine}</p>
              <p>
                <span className="font-medium">CHASIS: </span>
                {data.chassis}
              </p>
              <p>
                <span className="font-medium">COLOR: </span>
                {color}
              </p>
            </div>
          </div>
          <div className="text-right font-medium tabular-nums text-black">
            {formatAmount(data.car.price)}
          </div>
        </div>

        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={`font-bold ${inkMuted}`}>TOTAL AMOUNT</span>
              <span className={`font-bold tabular-nums ${inkMuted}`}>{formatAmount(data.car.price)}</span>
            </div>

            {data.amountPaid && (
              <div className="flex justify-between">
                <span className="font-medium text-black">AMOUNT PAID</span>
                <span className="font-medium tabular-nums text-black">{data.amountPaid}</span>
              </div>
            )}

            {data.amountDue !== undefined && data.amountPaid && (
              <div className="flex justify-between border-t border-neutral-300 pt-2">
                <span className={`text-base font-bold ${inkMuted}`}>BALANCE DUE</span>
                <span className={`text-base font-bold tabular-nums ${inkMuted}`}>{data.amountDue}</span>
              </div>
            )}

            {!data.amountPaid && (
              <div className="flex justify-between border-t border-neutral-300 pt-2">
                <span className={`text-base font-bold ${inkMuted}`}>TOTAL DUE</span>
                <span className={`text-2xl font-bold tabular-nums ${inkMuted}`}>{formatAmount(data.car.price)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank + thank you */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-6">
        <div className="flex items-end">
          <p
            className="text-5xl text-[#152a45] sm:text-6xl"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Thank you
          </p>
        </div>

        <div className="border-l-4 border-red-600 pl-4">
          <p className={`mb-3 text-sm font-bold ${red}`}>BANK DETAILS</p>
          <ul className="space-y-1.5 text-xs leading-relaxed text-black sm:text-sm">
            <li>
              <span className="font-semibold">ACCOUNT: </span>
              {PROFORMA_BANK.accountName}
            </li>
            <li>
              <span className="font-semibold">ACCOUNT NO TSH: </span>
              {PROFORMA_BANK.accountTzs} (TZS)
            </li>
            <li>
              <span className="font-semibold">ACCOUNT NO USD: </span>
              {PROFORMA_BANK.accountUsd} (USD)
            </li>
            <li>
              <span className="font-semibold">BANK NAME: </span>
              {PROFORMA_BANK.bankName}
            </li>
            <li>
              <span className="font-semibold">SWIFT CODE: </span>
              {PROFORMA_BANK.swift}
            </li>
            <li>
              <span className="font-semibold">ADDRESS: </span>
              {PROFORMA_BANK.address}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
