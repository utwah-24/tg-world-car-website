"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Heart, Mail, Phone, ReceiptText, ShoppingBag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Car } from "@/lib/cars-data"
import { useFavorites } from "@/lib/favorites"
import { CarCard } from "@/components/car-card"
import { ProfileQuotations } from "@/components/profile-quotations"

function ProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto h-24 w-24 rounded-full bg-muted" />
      <div className="mx-auto mt-5 h-8 w-52 rounded bg-muted" />
      <div className="mx-auto mt-3 h-5 w-72 rounded bg-muted" />
      <div className="mt-14 h-14 rounded-2xl bg-muted" />
      <div className="mt-8 h-64 rounded-2xl bg-muted" />
    </div>
  )
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShoppingBag
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-border bg-background px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href="/shop" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
        Browse cars
      </Link>
    </div>
  )
}

export function ProfileContent({ cars }: { cars: Car[] }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { favoriteIds, isLoading: favoritesAreLoading } = useFavorites()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin?next=/profile")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) return <ProfileLoading />

  const initial = user.username.trim().charAt(0).toUpperCase() || "U"
  const favoriteCars = favoriteIds
    .map((id) => cars.find((car) => Number(car.id) === id))
    .filter((car): car is Car => Boolean(car))

  return (
    <div className="bg-background pb-16">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="border-b border-border pb-10">
          <p className="mb-10 text-3xl font-black uppercase tracking-tight text-foreground sm:text-5xl">My profile</p>
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-950 text-3xl font-black text-white sm:h-24 sm:w-24">
              {initial}
            </div>
            <div className="mt-5 min-w-0 sm:ml-6 sm:mt-0 sm:pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">TG World account</p>
              <h1 className="mt-1 truncate text-3xl font-black tracking-tight text-foreground">{user.username}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Customer profile</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="truncate text-sm font-semibold text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Phone number</p>
                <p className="truncate text-sm font-semibold text-foreground">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="purchases" className="mt-8">
          <div className="overflow-x-auto border-b border-border">
            <TabsList className="h-auto min-w-max justify-start gap-2 rounded-none bg-transparent p-0">
              <TabsTrigger value="purchases" className="gap-2 rounded-none border-b-4 border-transparent px-5 py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                <ReceiptText className="h-4 w-4" />
                Purchases
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 rounded-none border-b-4 border-transparent px-5 py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="quotations" className="gap-2 rounded-none border-b-4 border-transparent px-5 py-4 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">
                <FileText className="h-4 w-4" />
                Quotes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="purchases" className="mt-7">
            <EmptyTab icon={ShoppingBag} title="No purchases yet" description="Cars you purchase through TG World will appear here with their order details and status." />
          </TabsContent>
          <TabsContent value="favorites" className="mt-7">
            {favoritesAreLoading ? (
              <div className="min-h-72 animate-pulse rounded-lg border border-border bg-muted/40" aria-label="Loading favorites" />
            ) : favoriteCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favoriteCars.map((car) => (
                  <CarCard key={car.id} car={car} compact />
                ))}
              </div>
            ) : (
              <EmptyTab icon={Heart} title="No favorites yet" description="Save cars you love while browsing and they’ll be collected here for easy comparison." />
            )}
          </TabsContent>
          <TabsContent value="quotations" className="mt-7">
            <ProfileQuotations />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
