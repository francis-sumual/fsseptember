import type React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardNav />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

