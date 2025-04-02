"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Bug } from "@/types/bug"
import type { User } from "@/types/user"
import { formatDate } from "@/lib/utils"
import { assignBug } from "@/lib/api"
import AssignBugDialog from "./assign-bug-dialog"

interface BugAssignmentProps {
  bugs: Bug[]
  developers: User[]
  onBugAssigned: (bug: Bug) => void
}

export default function BugAssignment({ bugs, developers, onBugAssigned }: BugAssignmentProps) {
  const { toast } = useToast()
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const handleAssign = async (bugId: string, developerId: string) => {
    try {
      const updatedBug = await assignBug(bugId, developerId)
      onBugAssigned(updatedBug)

      toast({
        title: "Bug assigned",
        description: "The bug has been successfully assigned.",
      })
    } catch (error) {
      console.error("Failed to assign bug:", error)
      toast({
        title: "Error",
        description: "Failed to assign bug. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (bugs.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No unassigned bugs</h3>
        <p className="text-muted-foreground">All bugs have been assigned to developers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Unassigned Bugs</h3>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugs.map((bug) => (
              <TableRow key={bug._id}>
                <TableCell className="font-medium">{bug.title}</TableCell>
                <TableCell>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">{bug.status}</Badge>
                </TableCell>
                <TableCell>{bug.createdBy?.username || "Unknown"}</TableCell>
                <TableCell>{formatDate(bug.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBug(bug)
                      setAssignDialogOpen(true)
                    }}
                  >
                    Assign
                  </Button>
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
          onAssign={handleAssign}
        />
      )}
    </div>
  )
}

