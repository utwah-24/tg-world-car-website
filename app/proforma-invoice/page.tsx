import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { ProformaInvoiceClient } from "@/components/proforma-invoice-client"

export default function ProformaInvoicePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="pt-20">
        <ProformaInvoiceClient />
      </div>
      <FooterWrapper />
    </main>
  )
}
