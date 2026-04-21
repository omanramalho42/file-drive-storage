"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { IconSidebar } from "@/components/kb/icon-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-14 border-r border-border">
        <IconSidebar />
      </aside>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:hidden z-50 left-0 top-0 h-dvh w-auto bg-background border-r
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <IconSidebar />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b bg-background">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
        <span className="font-semibold">Dashboard</span>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}