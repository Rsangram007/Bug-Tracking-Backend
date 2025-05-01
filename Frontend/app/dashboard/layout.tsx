import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import { NotificationsProvider } from "@/context/notifications-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = (await cookieStore).get("token")

  if (!token) {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-background">
      <NotificationsProvider>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden md:ml-72">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </NotificationsProvider>
    </div>
  )
}

