"use client"

import { useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Bug } from "@/types/bug"
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"

interface DashboardStatsProps {
  bugs: Bug[]
}

export default function DashboardStats({ bugs }: DashboardStatsProps) {
  const { user } = useAuth()

  const stats = useMemo(() => {
    // Filter bugs based on user role
    let relevantBugs = bugs
    if (user?.role === "developer") {
      relevantBugs = bugs.filter((bug) => bug.assignedTo?._id === user.id)
    } else if (user?.role === "qa") {
      relevantBugs = bugs.filter((bug) => bug.createdBy?._id === user.id)
    }

    // Count bugs by status
    const pending = relevantBugs.filter((bug) => bug.status === "Pending").length
    const fixed = relevantBugs.filter((bug) => bug.status === "Fixed").length
    const reopened = relevantBugs.filter((bug) => bug.status === "Reopened").length
    const done = relevantBugs.filter((bug) => bug.status === "Done").length

    return { pending, fixed, reopened, done, total: relevantBugs.length }
  }, [bugs, user])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">{stats.pending === 1 ? "bug" : "bugs"} awaiting action</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fixed</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fixed}</div>
          <p className="text-xs text-muted-foreground">{stats.fixed === 1 ? "bug" : "bugs"} awaiting verification</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reopened</CardTitle>
          <RefreshCw className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reopened}</div>
          <p className="text-xs text-muted-foreground">{stats.reopened === 1 ? "bug" : "bugs"} requiring more work</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <AlertCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.done}</div>
          <p className="text-xs text-muted-foreground">{stats.done === 1 ? "bug" : "bugs"} successfully resolved</p>
        </CardContent>
      </Card>
    </div>
  )
}

