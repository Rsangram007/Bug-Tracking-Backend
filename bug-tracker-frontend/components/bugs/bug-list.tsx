"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Bug } from "@/types/bug"
import { formatDate } from "@/lib/utils"
import { MoreHorizontal, ExternalLink } from "lucide-react"
import AssignBugDialog from "@/components/admin/assign-bug-dialog"
import { assignBug } from "@/lib/api"

interface BugListProps {
  bugs: Bug[]
  onBugsChanged?: (bugs: Bug[]) => void
}

export default function BugList({ bugs, onBugsChanged }: BugListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)

  const handleAssignBug = (bug: Bug) => {
    setSelectedBug(bug)
    setAssignDialogOpen(true)
  }

  const handleBugAssigned = async (bugId: string, developerId: string) => {
    try {
      const updatedBug = await assignBug(bugId, developerId)
      if (onBugsChanged) {
        onBugsChanged(bugs.map((bug) => (bug._id === updatedBug._id ? updatedBug : bug)))
      }
    } catch (error) {
      console.error("Failed to assign bug:", error)
    }
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

  if (bugs.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No bugs found</h3>
        <p className="text-muted-foreground">There are no bugs in this category.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug._id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/bugs/${bug._id}`} className="hover:underline flex items-center gap-1">
                    {bug.title}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(bug.status)}>{bug.status}</Badge>
                </TableCell>
                <TableCell>{bug.createdBy?.username || "Unknown"}</TableCell>
                <TableCell>{bug.assignedTo?.username || "Unassigned"}</TableCell>
                <TableCell>{formatDate(bug.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/bugs/${bug._id}`)}>
                        View Details
                      </DropdownMenuItem>
                      {user?.role === "admin" && !bug.assignedTo && (
                        <DropdownMenuItem onClick={() => handleAssignBug(bug)}>Assign Bug</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedBug && (
        <AssignBugDialog
          bug={selectedBug}
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          onAssign={handleBugAssigned}
        />
      )}
    </div>
  )
}

