"use client"

interface InfoCardsProps {
  companies?: string[]
}

export function InfoCards({ companies = [] }: InfoCardsProps) {
  if (companies.length === 0) return null

  const sorted = [...companies].sort()

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Browse by Brand
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((company) => (
            <a
              key={company}
              href={`/shop?company=${encodeURIComponent(company)}`}
              className="flex items-center justify-center py-3 px-4 rounded-xl border border-border hover:border-primary hover:bg-muted transition-all duration-150 group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {company}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
