"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Bug } from "@/types/bug"
import { fetchUsers } from "@/lib/api"
import type { User } from "@/types/user"

interface AssignBugDialogProps {
  bug: Bug
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (bugId: string, developerId: string) => void
}

export default function AssignBugDialog({ bug, open, onOpenChange, onAssign }: AssignBugDialogProps) {
  const [developerId, setDeveloperId] = useState("")
  const [developers, setDevelopers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        const users = await fetchUsers()
        const devs = users.filter((user) => user.role === "developer")
        setDevelopers(devs)

        if (devs.length > 0 && !developerId) {
          setDeveloperId(devs[0]._id)
        }
      } catch (error) {
        console.error("Failed to fetch developers:", error)
      }
    }

    if (open) {
      loadDevelopers()
    }
  }, [open, developerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onAssign(bug._id, developerId)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to assign bug:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Bug</DialogTitle>
            <DialogDescription>Assign this bug to a developer for resolution.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Bug: {bug.title}</h3>
              <p className="text-sm text-muted-foreground">{bug.description}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="developer">Assign to Developer</Label>
              <Select value={developerId} onValueChange={setDeveloperId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map((dev) => (
                    <SelectItem key={dev._id} value={dev._id}>
                      {dev.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !developerId}>
              {loading ? "Assigning..." : "Assign Bug"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

