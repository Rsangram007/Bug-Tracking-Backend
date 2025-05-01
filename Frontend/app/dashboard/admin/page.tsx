"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserManagement from "@/components/admin/user-management"
import BugAssignment from "@/components/admin/bug-assignment"
import { fetchUsers, fetchBugs } from "@/lib/api"
import type { User } from "@/types/user"
import type { Bug } from "@/types/bug"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  if (user && user.role !== "admin") {
    redirect("/dashboard")
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, bugsData] = await Promise.all([fetchUsers(), fetchBugs()])
        setUsers(usersData)
        setBugs(bugsData)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="bugs">Bug Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UserManagement users={users} onUserAdded={(newUser) => setUsers((prev) => [...prev, newUser])} />
            </TabsContent>
            <TabsContent value="bugs">
              <BugAssignment
                bugs={bugs.filter((bug) => !bug.assignedTo || bug.status === "Pending")}
                developers={users.filter((user) => user.role === "developer")}
                onBugAssigned={(updatedBug) => {
                  setBugs((prev) => prev.map((bug) => (bug._id === updatedBug._id ? updatedBug : bug)))
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

