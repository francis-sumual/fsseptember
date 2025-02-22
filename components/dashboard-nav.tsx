"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Users, UserIcon as UserGroup, UserPlus, Calendar, ClipboardList, LogOut } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/dashboard/groups",
      label: "Groups",
      icon: UserGroup,
    },
    {
      href: "/dashboard/members",
      label: "Members",
      icon: UserPlus,
    },
    {
      href: "/dashboard/gatherings",
      label: "Gatherings",
      icon: Calendar,
    },
    {
      href: "/dashboard/gathering-registrations",
      label: "Registrations",
      icon: ClipboardList,
    },
  ]

  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="p-4 space-y-2">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>
    </aside>
  )
}

