"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, ImageIcon, Paperclip } from "lucide-react"

interface BugAttachmentsProps {
  attachments: string[]
}

export default function BugAttachments({ attachments }: BugAttachmentsProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null)

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  const getAttachmentIcon = (url: string) => {
    if (isImage(url)) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getAttachmentName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/")
      return pathParts[pathParts.length - 1]
    } catch (e) {
      return url.split("/").pop() || "attachment"
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setSelectedAttachment(attachment)}
          >
            {getAttachmentIcon(attachment)}
            <span className="max-w-[150px] truncate">{getAttachmentName(attachment)}</span>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedAttachment} onOpenChange={(open) => !open && setSelectedAttachment(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attachment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            {selectedAttachment && isImage(selectedAttachment) ? (
              <div className="relative w-full h-[500px]">
                <Image
                  src={selectedAttachment || "/placeholder.svg"}
                  alt="Attachment"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <Paperclip className="h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-center">This attachment cannot be previewed.</p>
                <Button className="mt-4" onClick={() => window.open(selectedAttachment || "", "_blank")}>
                  Download Attachment
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

