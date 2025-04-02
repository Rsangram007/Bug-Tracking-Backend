import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/auth/login-form"
import ApiStatus from "@/components/debug/api-status"

export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (token) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Bug Tracker</h1>
          <p className="mt-2 text-muted-foreground">Track, manage, and resolve software bugs efficiently</p>
        </div>

        <LoginForm />

        <div className="mt-8">
          <ApiStatus />
        </div>
      </div>
    </main>
  )
}

