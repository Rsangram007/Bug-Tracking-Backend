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

interface BugVerificationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (status: string, comment: string) => void
}

export default function BugVerification({ open, onOpenChange, onVerify }: BugVerificationProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState("Done")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onVerify(status, comment)

      toast({
        title: "Bug verified",
        description: `Bug has been ${status === "Done" ? "marked as resolved" : "reopened"}.`,
      })

      onOpenChange(false)

      // Reset form
      setComment("")
    } catch (error) {
      console.error("Failed to verify bug:", error)
      toast({
        title: "Error",
        description: "Failed to verify bug. Please try again.",
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
            <DialogTitle>Verify Bug Fix</DialogTitle>
            <DialogDescription>Verify if the bug has been fixed correctly or needs to be reopened.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Verification Result</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Done">Fixed Successfully</SelectItem>
                  <SelectItem value="Reopened">Reopen Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  status === "Reopened"
                    ? "Please explain why the bug needs to be reopened"
                    : "Add any additional comments about the fix"
                }
                rows={5}
                required={status === "Reopened"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Verification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

