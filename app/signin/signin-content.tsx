"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { authApi, AuthApiError, normalizeTanzanianPhone, safeRedirect } from "@/lib/auth-api"

interface SignInContentProps {
  darkLogoUrl: string
}

export function SignInContent({ darkLogoUrl }: SignInContentProps) {
  const router = useRouter()
  const { setAuthenticatedUser } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [visible, setVisible] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [signInData, setSignInData] = useState({ usernameOrEmail: "", password: "" })
  const [signUpData, setSignUpData] = useState({ username: "", email: "", phone: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const switchMode = (toSignUp: boolean) => {
    setFormError("")
    setFieldErrors({})
    setVisible(false)
    setTimeout(() => {
      setIsSignUp(toSignUp)
      setShowPassword(false)
      setVisible(true)
    }, 150)
  }

  const messageForError = (error: unknown) => {
    if (!(error instanceof AuthApiError)) return "Something went wrong. Please try again."
    if (error.code === "RATE_LIMITED") return "Too many attempts. Please wait before trying again."
    if (error.code === "INVALID_CREDENTIALS") return "The supplied credentials are invalid."
    if (error.code === "ACCOUNT_EXISTS") return "That username, email, or phone number is already registered. Try different details or sign in."
    return error.message
  }

  const finishAuthentication = (user: Awaited<ReturnType<typeof authApi.login>>["user"]) => {
    setAuthenticatedUser(user)
    const next = new URLSearchParams(window.location.search).get("next")
    router.replace(safeRedirect(next, "/"))
    router.refresh()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    setFieldErrors({})
    try {
      const response = await authApi.login(signInData)
      finishAuthentication(response.user)
    } catch (error) {
      setSignInData((data) => ({ ...data, password: "" }))
      setFieldErrors(error instanceof AuthApiError ? error.fields : {})
      setFormError(messageForError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    setFieldErrors({})
    try {
      const response = await authApi.register({
        ...signUpData,
        phone: normalizeTanzanianPhone(signUpData.phone),
      })
      finishAuthentication(response.user)
    } catch (error) {
      setSignUpData((data) => ({ ...data, password: "" }))
      const nextFieldErrors = error instanceof AuthApiError ? error.fields : {}
      setFieldErrors(nextFieldErrors)
      setFormError(
        error instanceof AuthApiError &&
        error.code === "ACCOUNT_EXISTS" &&
        Object.keys(nextFieldErrors).length > 0
          ? ""
          : messageForError(error),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldMessage = (name: string) => fieldErrors[name]?.[0]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Cover image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/coverpage_signin.jpeg"
          alt="TG World Cars"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col px-6 py-12 bg-background">
        {/* Back link */}
        <div className="flex justify-start mb-auto pb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Animated form container */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-full max-w-md relative pt-32"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
          >
            {/* Logo */}
            <Link href="/" className="absolute top-0 left-0">
              <div className="relative h-24 w-48">
                <Image
                  src={darkLogoUrl}
                  alt="TG World"
                  fill
                  className="origin-left scale-150 object-contain object-left"
                  priority
                  unoptimized={darkLogoUrl?.startsWith("http")}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder-logo.svg"
                  }}
                />
              </div>
            </Link>

            {isSignUp ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
                <p className="text-muted-foreground mb-8">
                  Join TG World. Fill in your details to get started.
                </p>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      required
                      className="h-11"
                      disabled={isSubmitting}
                    />
                    {fieldMessage("username") && <p className="text-xs text-destructive">{fieldMessage("username")}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className="h-11"
                      disabled={isSubmitting}
                    />
                    {fieldMessage("email") && <p className="text-xs text-destructive">{fieldMessage("email")}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      required
                      className="h-11"
                      disabled={isSubmitting}
                    />
                    {fieldMessage("phone") && <p className="text-xs text-destructive">{fieldMessage("phone")}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        className="h-11 pr-10"
                        minLength={10}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldMessage("password") && <p className="text-xs text-destructive">{fieldMessage("password")}</p>}
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-medium !mt-5" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Create Account"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => switchMode(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
                <p className="text-muted-foreground mb-8">
                  Welcome back. Enter your credentials to access your account.
                </p>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
                  <div className="space-y-1.5">
                    <Label htmlFor="usernameOrEmail">Username / Email</Label>
                    <Input
                      id="usernameOrEmail"
                      type="text"
                      placeholder="Enter your username or email"
                      value={signInData.usernameOrEmail}
                      onChange={(e) => setSignInData({ ...signInData, usernameOrEmail: e.target.value })}
                      required
                      className="h-11"
                      disabled={isSubmitting}
                    />
                    {fieldMessage("usernameOrEmail") && <p className="text-xs text-destructive">{fieldMessage("usernameOrEmail")}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        className="h-11 pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldMessage("password") && <p className="text-xs text-destructive">{fieldMessage("password")}</p>}
                  </div>

                  <div className="flex items-center justify-end">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in…" : "Sign In"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => switchMode(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Create account
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
