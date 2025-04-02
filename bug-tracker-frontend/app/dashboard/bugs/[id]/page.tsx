"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Bug } from "@/types/bug"
import { fetchBugById, updateBugStatus, verifyBug } from "@/lib/api"
import BugStatusUpdate from "@/components/bugs/bug-status-update"
import BugVerification from "@/components/bugs/bug-verification"
import BugComments from "@/components/bugs/bug-comments"
import BugAttachments from "@/components/bugs/bug-attachments"
import { formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

export default function BugDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)

  useEffect(() => {
    const loadBug = async () => {
      try {
        const data = await fetchBugById(params.id)
        setBug(data)
      } catch (error) {
        console.error("Failed to fetch bug:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBug()
  }, [params.id])

  const handleStatusUpdate = async (status: string, fixDescription: string) => {
    if (!bug) return

    try {
      const updatedBug = await updateBugStatus(bug._id, status, fixDescription)
      setBug(updatedBug)
    } catch (error) {
      console.error("Failed to update bug status:", error)
    }
  }

  const handleVerification = async (status: string, comment: string) => {
    if (!bug) return

    try {
      const updatedBug = await verifyBug(bug._id, status, comment)
      setBug(updatedBug)
    } catch (error) {
      console.error("Failed to verify bug:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <Skeleton className="h-[600px] rounded-lg" />
      </div>
    )
  }

  if (!bug) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold">Bug not found</h2>
        <p className="text-muted-foreground">The bug you're looking for doesn't exist or you don't have access.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/bugs")}>
          Back to Bugs
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Fixed":
        return "bg-blue-500 hover:bg-blue-600"
      case "Reopened":
        return "bg-red-500 hover:bg-red-600"
      case "Done":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/bugs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Bug Details</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">{bug.title}</CardTitle>
          <Badge className={getStatusColor(bug.status)}>{bug.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="mt-1 whitespace-pre-wrap">{bug.description}</p>
            </div>

            {bug.fixDescription && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Fix Description</h3>
                <p className="mt-1 whitespace-pre-wrap">{bug.fixDescription}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Reported By</h3>
              <p className="mt-1">{bug.createdBy?.username || "Unknown"}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Assigned To</h3>
              <p className="mt-1">{bug.assignedTo?.username || "Unassigned"}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Reported On</h3>
              <p className="mt-1">{formatDate(bug.createdAt)}</p>
            </div>
          </div>

          {bug.attachments && bug.attachments.length > 0 && (
            <div className="pt-4">
              <h3 className="font-medium mb-2">Attachments</h3>
              <BugAttachments attachments={bug.attachments} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            {user?.role === "developer" && bug.assignedTo?._id === user.id && bug.status !== "Done" && (
              <Button onClick={() => setIsStatusDialogOpen(true)}>Update Status</Button>
            )}

            {user?.role === "qa" && bug.createdBy?._id === user.id && bug.status === "Fixed" && (
              <Button onClick={() => setIsVerifyDialogOpen(true)}>Verify Fix</Button>
            )}
          </div>

          {bug.comments && bug.comments.length > 0 && (
            <div className="pt-4">
              <h3 className="font-medium mb-2">Comments</h3>
              <BugComments comments={bug.comments} />
            </div>
          )}
        </CardContent>
      </Card>

      {user?.role === "developer" && (
        <BugStatusUpdate
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          onStatusUpdate={handleStatusUpdate}
          currentStatus={bug.status}
        />
      )}

      {user?.role === "qa" && (
        <BugVerification open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen} onVerify={handleVerification} />
      )}
    </div>
  )
}

