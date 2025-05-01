"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

interface BugStatusUpdateProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (status: string, fixDescription: string) => void
  currentStatus: string
}

export default function BugStatusUpdate({ open, onOpenChange, onStatusUpdate, currentStatus }: BugStatusUpdateProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState(currentStatus)
  const [fixDescription, setFixDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onStatusUpdate(status, fixDescription)

      toast({
        title: "Status updated",
        description: `Bug status has been updated to ${status}.`,
      })

      onOpenChange(false)

      // Reset form
      setFixDescription("")
    } catch (error) {
      console.error("Failed to update status:", error)

      let errorMessage = "Failed to update bug status. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || "Failed to update bug status. Please try again."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Bug Status</DialogTitle>
            <DialogDescription>Change the status of this bug and provide details about the fix.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixDescription">Fix Description</Label>
              <Textarea
                id="fixDescription"
                value={fixDescription}
                onChange={(e) => setFixDescription(e.target.value)}
                placeholder="Describe how you fixed the bug or what changes were made"
                rows={5}
                required={status === "Fixed"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

