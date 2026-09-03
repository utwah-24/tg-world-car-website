"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthPageShell } from "@/components/auth-page-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, AuthApiError } from "@/lib/auth-api"

export function ForgotPasswordContent() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      const response = await authApi.forgotPassword(email)
      setSuccess(response.message)
    } catch (requestError) {
      const message = requestError instanceof AuthApiError && requestError.code === "RATE_LIMITED"
        ? "Too many attempts. Please wait before trying again."
        : requestError instanceof AuthApiError
          ? requestError.message
          : "Unable to submit your request. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell>
      <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we’ll send password-reset instructions if an account matches it.
      </p>

      {success ? (
        <div className="mt-6 space-y-5">
          <Alert><AlertDescription>{success}</AlertDescription></Alert>
          <Link href="/signin" className="inline-flex text-sm font-medium text-primary hover:underline">Return to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-1.5">
            <Label htmlFor="recovery-email">Email</Label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset instructions"}
          </Button>
          <Link href="/signin" className="block text-center text-sm text-muted-foreground hover:text-foreground">Back to sign in</Link>
        </form>
      )}
    </AuthPageShell>
  )
}

