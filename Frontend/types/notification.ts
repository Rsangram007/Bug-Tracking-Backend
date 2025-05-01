export interface Notification {
  _id: string
  user: string
  message: string
  bugId?: string
  read: boolean
  createdAt: string
}

