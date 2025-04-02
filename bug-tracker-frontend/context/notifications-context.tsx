"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSocket } from "./socket-context"
import { useAuth } from "./auth-context"
import type { Notification } from "@/types/notification"
import { useToast } from "@/components/ui/use-toast"

interface NotificationsContextType {
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  setNotifications: () => {},
})

export const useNotifications = () => useContext(NotificationsContext)

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket()
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!socket || !user) return

    // Listen for new notifications
    const handleNotification = (notification: Notification) => {
      console.log("New notification received:", notification)

      // Add to notifications state
      setNotifications((prev) => [notification, ...prev])

      // Show toast
      toast({
        title: "New Notification",
        description: notification.message,
      })
    }

    socket.on("notification", handleNotification)

    return () => {
      socket.off("notification", handleNotification)
    }
  }, [socket, user, toast])

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  )
}

