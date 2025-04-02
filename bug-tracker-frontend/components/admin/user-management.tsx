"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/types/user"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import AddUserDialog from "./add-user-dialog"

interface UserManagementProps {
  users: User[]
  onUserAdded: (user: User) => void
}

export default function UserManagement({ users, onUserAdded }: UserManagementProps) {
  const { toast } = useToast()
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500 hover:bg-purple-600"
      case "developer":
        return "bg-blue-500 hover:bg-blue-600"
      case "qa":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Users</h3>
        <Button onClick={() => setAddUserDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddUserDialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen} onUserAdded={onUserAdded} />
    </div>
  )
}

