import { SideNav } from "@/components/base/side-nav"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerencie seus aqruivos",
  description: "Gerencie seus arquivos da melhor forma",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
        <SideNav />

        <div className="w-full">{children}</div>
      </div>
    </main>
  )
}