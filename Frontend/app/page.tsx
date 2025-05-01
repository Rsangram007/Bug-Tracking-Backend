import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/auth/login-form"
import { Bug } from "lucide-react"
import ApiConnectionStatus from "@/components/auth/api-connection-status"

export default async function Home() {
  const cookieStore = cookies()
  const token = await (await cookieStore).get("token")

  if (token) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Login form */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-6 md:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
              <Bug className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Bug Tracker</h1>
            <p className="mt-2 text-muted-foreground">Track, manage, and resolve software bugs efficiently</p>
          </div>

          <LoginForm />
          <ApiConnectionStatus />
        </div>
      </div>

      {/* Right side - Decorative section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-10">
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold">Streamline Your Bug Management Process</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-4">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Report & Track Bugs</h3>
                <p className="text-sm text-muted-foreground">
                  Easily report bugs with detailed descriptions and attachments
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-4">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Assign & Collaborate</h3>
                <p className="text-sm text-muted-foreground">
                  Assign bugs to team members and collaborate on solutions
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-4">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Resolve & Verify</h3>
                <p className="text-sm text-muted-foreground">Track bug resolution and verify fixes before closing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

