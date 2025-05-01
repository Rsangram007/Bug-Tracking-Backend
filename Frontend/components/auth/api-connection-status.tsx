"use client"

/**
 * API Connection Status Component - Diagnostic UI
 * This component checks and displays API connectivity status during development.
 * Can be safely removed if not needed in production.
 */
import { useEffect, useState } from "react"
import { testApiConnection } from "@/lib/api"
import { Loader2, WifiOff, Wifi } from "lucide-react"

export default function ApiConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testApiConnection()
        if (result.status === "success") {
          setStatus("connected")
        } else {
          setStatus("error")
        }
        setMessage(result.message)
      } catch (error) {
        setStatus("error")
        setMessage("Failed to check API connection")
      }
    }

    checkConnection()
  }, [])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground mt-4">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking API connection...
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center text-sm text-destructive mt-4">
        <WifiOff className="h-4 w-4 mr-2" />
        {message || "API connection error"}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center text-sm text-emerald-500 mt-4">
      <Wifi className="h-4 w-4 mr-2" />
      Connected to API
    </div>
  )
}

