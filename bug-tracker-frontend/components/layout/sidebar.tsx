"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useNotifications } from "@/context/notifications-context"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Bug, Users, Bell, LogOut, Menu } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { notifications } = useNotifications()
  const [open, setOpen] = useState(false)

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
      icon: Users,
      href: "/dashboard/admin",
      active: pathname === "/dashboard/admin",
    })
  }

  const SidebarContent = (
    <>
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Bug Tracker</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
              <Button variant={route.active ? "secondary" : "ghost"} className="w-full justify-start">
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
                {route.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {route.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            logout()
            setOpen(false)
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
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
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ScrollArea className="h-full">{SidebarContent}</ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30", "border-r bg-background")}>
        <ScrollArea className="flex flex-col h-full">{SidebarContent}</ScrollArea>
      </div>
    </>
  )
}

