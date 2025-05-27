import type React from "react"
import { Navbar } from "@/components/dashboard/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-4 pb-12">{children}</div>
    </div>
  )
}
