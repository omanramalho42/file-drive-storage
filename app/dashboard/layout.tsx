"use client"
import { useState } from "react"

import { SideNav } from "@/components/base/side-nav"
import { Menu } from "lucide-react"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false)

  return (
    <main className="min-h-screen">
      {/* HEADER MOBILE */}
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>

        <span className="font-bold">Dashboard</span>
      </div>

      <div className="flex">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:block w-64 border-r min-h-screen">
          <SideNav />
        </div>

        {/* SIDEBAR MOBILE (DRAWER) */}
        {open && (
          <div className="fixed inset-0 z-50 flex">
            {/* overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* sidebar */}
            <div className="relative w-64 bg-background h-full shadow-lg">
              <SideNav />
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </main>
  )
}