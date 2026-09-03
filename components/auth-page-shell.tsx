import Image from "next/image"
import Link from "next/link"

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="relative h-12 w-36" aria-label="TG World home">
            <Image src="/logos/Logo%20tg1.png" alt="TG World" fill className="object-contain object-left" priority />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Back to home
          </Link>
        </div>
        <main className="flex flex-1 items-center">
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

