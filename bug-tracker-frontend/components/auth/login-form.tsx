"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/lib/api"

export default function LoginForm() {
  const router = useRouter()
  const { setUser, setToken } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { token, user } = await login(email, password)

      // Set auth context
      setUser(user)
      setToken(token)

      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)

      // Provide more specific error messages based on the error
      let errorMessage = "Invalid email or password. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("fetch") || error.message.includes("connect")) {
          errorMessage =
            "Cannot connect to the server. Please check your network connection and make sure the API server is running."
        } else if (error.message.includes("404") || error.message.includes("endpoint")) {
          errorMessage =
            "API endpoint not found. The server is running but the login endpoint may be at a different path."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

