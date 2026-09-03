"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthPageShell } from "@/components/auth-page-shell"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, AuthApiError } from "@/lib/auth-api"

export function ResetPasswordContent({ token }: { token: string }) {
  const router = useRouter()
  const { setAuthenticatedUser } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (password !== confirmation) {
      setError("The passwords do not match.")
      return
    }
    if (!token) {
      setError("This reset link is invalid. Please request a new one.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authApi.resetPassword(token, password)
      setAuthenticatedUser(response.user)
      router.replace("/")
      router.refresh()
    } catch (requestError) {
      setPassword("")
      setConfirmation("")
      if (requestError instanceof AuthApiError && requestError.code === "INVALID_RESET_TOKEN") {
        setError("This reset link is invalid or expired. Please request a new one.")
      } else if (requestError instanceof AuthApiError && requestError.code === "RATE_LIMITED") {
        setError("Too many attempts. Please wait before trying again.")
      } else {
        setError(requestError instanceof AuthApiError ? requestError.message : "Unable to reset your password. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell>
      <h1 className="text-3xl font-bold text-foreground">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use at least 10 characters.</p>
      {!token && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>This reset link is missing its token. Request a new link below.</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" minLength={10} maxLength={255} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isSubmitting || !token} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" minLength={10} maxLength={255} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required disabled={isSubmitting || !token} className="h-11" />
        </div>
        <Button type="submit" className="h-11 w-full" disabled={isSubmitting || !token}>
          {isSubmitting ? "Resetting…" : "Reset password"}
        </Button>
        <Link href="/forgot-password" className="block text-center text-sm text-muted-foreground hover:text-foreground">Request a new reset link</Link>
      </form>
    </AuthPageShell>
  )
}

