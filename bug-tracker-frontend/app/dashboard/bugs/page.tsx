"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BugList from "@/components/bugs/bug-list"
import ReportBugDialog from "@/components/bugs/report-bug-dialog"
import type { Bug } from "@/types/bug"
import { fetchBugs } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle } from "lucide-react"

export default function BugsPage() {
  const { user } = useAuth()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  useEffect(() => {
    const loadBugs = async () => {
      try {
        const data = await fetchBugs()
        setBugs(data)
      } catch (error) {
        console.error("Failed to fetch bugs:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBugs()
  }, [])

  const handleBugCreated = (newBug: Bug) => {
    setBugs((prevBugs) => [newBug, ...prevBugs])
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Bug Management</h1>
        {user?.role === "qa" && (
          <Button onClick={() => setIsReportDialogOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Report Bug
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bugs</CardTitle>
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
              <BugList bugs={bugs} onBugsChanged={setBugs} />
            </TabsContent>
            <TabsContent value="pending">
              <BugList bugs={bugs.filter((bug) => bug.status === "Pending")} onBugsChanged={setBugs} />
            </TabsContent>
            <TabsContent value="fixed">
              <BugList bugs={bugs.filter((bug) => bug.status === "Fixed")} onBugsChanged={setBugs} />
            </TabsContent>
            <TabsContent value="reopened">
              <BugList bugs={bugs.filter((bug) => bug.status === "Reopened")} onBugsChanged={setBugs} />
            </TabsContent>
            <TabsContent value="done">
              <BugList bugs={bugs.filter((bug) => bug.status === "Done")} onBugsChanged={setBugs} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ReportBugDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} onBugCreated={handleBugCreated} />
    </div>
  )
}

