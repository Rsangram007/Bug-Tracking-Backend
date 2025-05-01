"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BugList from "@/components/bugs/bug-list"
import type { Bug } from "@/types/bug"
import { fetchBugs } from "@/lib/api"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const { user } = useAuth()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBugs = async () => {
      try {
        if (!user) {
          throw new Error("Authentication required. Please login to access this feature.")
        }
        const data = await fetchBugs()
        setBugs(data)
      } catch (error) {
        console.error("Failed to fetch bugs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBugs()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
        </div>
        <Skeleton className="h-[400px] rounded-lg mt-4" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.username}</h1>

      <DashboardStats bugs={bugs} />

      <Card>
        <CardHeader>
          <CardTitle>Bug Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="fixed">Fixed</TabsTrigger>
              <TabsTrigger value="reopened">Reopened</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <BugList bugs={bugs} />
            </TabsContent>
            <TabsContent value="pending">
              <BugList bugs={bugs.filter((bug) => bug.status === "Pending")} />
            </TabsContent>
            <TabsContent value="fixed">
              <BugList bugs={bugs.filter((bug) => bug.status === "Fixed")} />
            </TabsContent>
            <TabsContent value="reopened">
              <BugList bugs={bugs.filter((bug) => bug.status === "Reopened")} />
            </TabsContent>
            <TabsContent value="done">
              <BugList bugs={bugs.filter((bug) => bug.status === "Done")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

