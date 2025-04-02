"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications } from "@/context/notifications-context"
import { formatDate } from "@/lib/utils"
import { markNotificationAsRead, fetchNotifications } from "@/lib/api"
import type { Notification } from "@/types/notification"
import { Bell, Check } from "lucide-react"

export default function NotificationsPage() {
  const { notifications, setNotifications } = useNotifications()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications()
        setNotifications(data)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [setNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifications.map((notification) => markNotificationAsRead(notification._id)))

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    notification.read ? "bg-background" : "bg-muted"
                  }`}
                >
                  <div className="space-y-1">
                    <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification._id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

