"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface SignInContentProps {
  darkLogoUrl: string
}

export function SignInContent({ darkLogoUrl }: SignInContentProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [visible, setVisible] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [signInData, setSignInData] = useState({ usernameOrEmail: "", password: "" })
  const [signUpData, setSignUpData] = useState({ username: "", email: "", phone: "", password: "" })

  const switchMode = (toSignUp: boolean) => {
    setVisible(false)
    setTimeout(() => {
      setIsSignUp(toSignUp)
      setShowPassword(false)
      setVisible(true)
    }, 150)
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
  }

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
            className="w-full max-w-md relative pt-16"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
          >
            {/* Logo */}
            <Link href="/" className="absolute top-0 left-0">
              <div className="relative h-10 w-36">
                <Image
                  src={darkLogoUrl}
                  alt="TG World"
                  fill
                  className="object-contain object-left"
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
                    />
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
                    />
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
                    />
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
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-medium !mt-5">
                    Create Account
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
                    />
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
                  </div>

                  <div className="flex items-center justify-end">
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-medium">
                    Sign In
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
