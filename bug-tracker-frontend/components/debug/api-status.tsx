"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { testApiConnection } from "@/lib/api"

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "partial" | "error">("checking")
  const [details, setDetails] = useState<any>(null)
  const [apiUrl, setApiUrl] = useState<string>("")

  const checkApiConnection = async () => {
    setStatus("checking")
    setDetails(null)

    try {
      // Get the API URL from environment variable
      const url = process.env.NEXT_PUBLIC_API_URL || "Not configured"
      setApiUrl(url)

      if (url === "Not configured") {
        throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured")
      }

      // Test API connection using our helper function
      const result = await testApiConnection()
      setDetails(result)

      if (result.rootConnected && result.authEndpointExists) {
        setStatus("connected")
      } else if (result.rootConnected) {
        setStatus("partial")
      } else {
        setStatus("error")
      }
    } catch (error) {
      setStatus("error")
      if (error instanceof Error) {
        setDetails({ error: error.message })
      } else {
        setDetails({ error: "Unknown error occurred" })
      }
    }
  }

  useEffect(() => {
    checkApiConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Connection Status
          {status === "connected" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "partial" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          {status === "checking" && <RefreshCw className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>Checking connection to your backend API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">API URL:</p>
          <p className="text-sm font-mono break-all">{apiUrl}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Status:</p>
          <Badge
            className={
              status === "connected"
                ? "bg-green-500"
                : status === "partial"
                  ? "bg-yellow-500"
                  : status === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
            }
          >
            {status === "connected"
              ? "Connected"
              : status === "partial"
                ? "Partial Connection"
                : status === "error"
                  ? "Error"
                  : "Checking..."}
          </Badge>
        </div>

        {details && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Details:</p>

            {details.rootConnected !== undefined && (
              <div className="flex items-center gap-2">
                <Badge className={details.rootConnected ? "bg-green-500" : "bg-red-500"}>
                  {details.rootConnected ? "Root API Accessible" : "Root API Not Accessible"}
                </Badge>
              </div>
            )}

            {details.authEndpointExists !== undefined && (
              <div className="flex items-center gap-2">
                <Badge className={details.authEndpointExists ? "bg-green-500" : "bg-red-500"}>
                  {details.authEndpointExists ? "Auth Endpoint Available" : "Auth Endpoint Not Found"}
                </Badge>
              </div>
            )}

            {details.message && <p className="text-sm">{details.message}</p>}

            {details.error && <p className="text-sm text-red-500">{details.error}</p>}

            {details.status && <p className="text-sm">Status code: {details.status}</p>}
          </div>
        )}

        <div className="text-sm space-y-2 border-t pt-2">
          <p className="font-medium">Troubleshooting Tips:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check if your backend server is running</li>
            <li>Verify the API endpoints match what your frontend expects</li>
            <li>Ensure CORS is properly configured on your backend</li>
            <li>Check if your backend requires specific headers</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkApiConnection} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Recheck Connection
        </Button>
      </CardFooter>
    </Card>
  )
}

