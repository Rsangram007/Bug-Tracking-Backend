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
import { MoreHorizontal, ExternalLink, User, Calendar, ArrowUpRight } from "lucide-react"
import AssignBugDialog from "@/components/admin/assign-bug-dialog"
import { assignBug } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"

interface BugListProps {
  bugs: Bug[]
  onBugsChanged?: (bugs: Bug[]) => void
}

export default function BugList({ bugs, onBugsChanged }: BugListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

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
        return "status-pending"
      case "Fixed":
        return "status-fixed"
      case "Reopened":
        return "status-reopened"
      case "Done":
        return "status-done"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (bugs.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card/50">
        <h3 className="text-lg font-medium">No bugs found</h3>
        <p className="text-muted-foreground mt-1">There are no bugs in this category.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "table" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Cards
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border overflow-hidden">
          <div className="responsive-table">
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
                  <TableRow key={bug._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/bugs/${bug._id}`} className="hover:text-primary flex items-center gap-1">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bugs.map((bug) => (
            <Card key={bug._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className={`h-2 w-full ${getStatusColor(bug.status)}`} />
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(bug.status)}>{bug.status}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/bugs/${bug._id}`)}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium line-clamp-2">{bug.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{bug.description}</p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-1 h-3 w-3" />
                    <span className="mr-3">{bug.createdBy?.username || "Unknown"}</span>
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{formatDate(bug.createdAt)}</span>
                  </div>

                  {user?.role === "admin" && !bug.assignedTo && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleAssignBug(bug)}>
                      Assign Bug
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

