"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useNotifications } from "@/context/notifications-context"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Bug, Bell, LogOut, Menu, Shield } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { notifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Bugs",
      icon: Bug,
      href: "/dashboard/bugs",
      active: pathname === "/dashboard/bugs" || pathname.startsWith("/dashboard/bugs/"),
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ]

  // Add admin route if user is admin
  if (user?.role === "admin") {
    routes.push({
      label: "Admin",
      icon: Shield,
      href: "/dashboard/admin",
      active: pathname === "/dashboard/admin",
    })
  }

  if (!mounted) {
    return null
  }

  const SidebarContent = (
    <>
      <div className="px-3 py-4">
        <div className="mb-6 flex items-center px-4">
          <Bug className="mr-2 h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">BugTracker</h2>
        </div>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
              <Button variant={route.active ? "secondary" : "ghost"} className="w-full justify-start" size="lg">
                <route.icon className="mr-2 h-5 w-5" />
                {route.label}
                {route.badge && (
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground notification-pulse">
                    {route.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto px-3 py-4 border-t border-border">
        <div className="flex items-center px-4 py-2 mb-2">
          <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          size="lg"
          onClick={() => {
            logout()
            setOpen(false)
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed left-4 top-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <ScrollArea className="h-full">{SidebarContent}</ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30", "border-r bg-card")}>
        <ScrollArea className="flex flex-col h-full">{SidebarContent}</ScrollArea>
      </div>
    </>
  )
}

