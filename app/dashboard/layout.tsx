"use client"

import { useState } from "react"
import { IconSidebar } from "@/components/kb/icon-sidebar"
import { Header } from "@/components/kb/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* SIDEBARS (Mantém sua lógica atual) */}
      <aside className="hidden md:flex w-14 border-r border-border">
        <IconSidebar />
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {open && <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      
      <aside className={`fixed md:hidden z-50 h-dvh w-auto bg-background border-r transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <IconSidebar />
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header integrado para Web e Mobile */}
        <Header onMenuClick={() => setOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}