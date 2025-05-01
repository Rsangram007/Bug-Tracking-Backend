"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { reportBug } from "@/lib/api"
import type { Bug } from "@/types/bug"
import { Loader2, Upload } from "lucide-react"
import axios from "axios"

interface ReportBugDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBugCreated: (bug: Bug) => void
}

export default function ReportBugDialog({ open, onOpenChange, onBugCreated }: ReportBugDialogProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("attachments", files[i])
        }
      }

      const bug = await reportBug(formData)

      toast({
        title: "Bug reported",
        description: "Your bug has been successfully reported.",
      })

      onBugCreated(bug)
      onOpenChange(false)

      // Reset form
      setTitle("")
      setDescription("")
      setFiles(null)
    } catch (error) {
      console.error("Failed to report bug:", error)

      let errorMessage = "Failed to report bug. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || "Failed to report bug. Please try again."
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
            <DialogTitle>Report a Bug</DialogTitle>
            <DialogDescription>Provide details about the bug you've encountered.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the bug"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description, steps to reproduce, expected behavior, etc."
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="border rounded-md p-2 bg-muted/30">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="border-0 bg-transparent p-0"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <Upload className="h-3 w-3 mr-1" />
                  Add screenshots or other relevant files
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

