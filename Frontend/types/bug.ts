import type { User } from "./user"

export type BugStatus = "Pending" | "Fixed" | "Reopened" | "Done"

export interface Comment {
  text: string
  user: User
  createdAt: string
}

export interface Bug {
  _id: string
  title: string
  description: string
  status: BugStatus
  attachments: string[]
  createdBy: User
  assignedTo?: User
  fixDescription?: string
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

