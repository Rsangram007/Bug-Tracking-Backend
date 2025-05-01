import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import type { Comment } from "@/types/bug"

interface BugCommentsProps {
  comments: Comment[]
}

export default function BugComments({ comments }: BugCommentsProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div key={index} className="flex gap-3 p-3 rounded-lg border bg-muted/30">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {comment.user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{comment.user?.username || "Unknown User"}</p>
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

