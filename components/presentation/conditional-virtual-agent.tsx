"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { VirtualAgent } from "./virtual-agent"

export function ConditionalVirtualAgent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname.includes("/login")

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Asistente virtual - parte superior */}
      <div className="w-full h-1/2 min-h-[350px] border-b border-gray-200 pt-16">
        <VirtualAgent />
      </div>

      {/* Aplicación NovaBank - parte inferior */}
      <div className="w-full h-1/2 overflow-auto">{children}</div>
    </div>
  )
}
