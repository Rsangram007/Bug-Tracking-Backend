"use client"

import { useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="overflow-hidden border-l-4 border-l-amber-500">
        <CardContent className="p-6 flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{stats.pending}</h3>
              <p className="ml-2 text-xs text-muted-foreground">{stats.pending === 1 ? "bug" : "bugs"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-blue-500">
        <CardContent className="p-6 flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fixed</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{stats.fixed}</h3>
              <p className="ml-2 text-xs text-muted-foreground">{stats.fixed === 1 ? "bug" : "bugs"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-rose-500">
        <CardContent className="p-6 flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/20">
            <RefreshCw className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reopened</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{stats.reopened}</h3>
              <p className="ml-2 text-xs text-muted-foreground">{stats.reopened === 1 ? "bug" : "bugs"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-emerald-500">
        <CardContent className="p-6 flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
            <AlertCircle className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resolved</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{stats.done}</h3>
              <p className="ml-2 text-xs text-muted-foreground">{stats.done === 1 ? "bug" : "bugs"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

