"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Banknote, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/dashboard/navbar"
export default function NotificationsPage() {
  const router = useRouter()
  const availableBalance = 18500.75 // Simulado, normalmente vendría de la API

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-screen-xl mx-auto">
      <Navbar />

      <div className="bg-white rounded-xl p-4">
        <h2 className="text-xl font-semibold text-[#1C3B5A] mb-6">Condiciones para retiro anticipado.</h2>
        <ul className="space-y-3 text-left">
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Penalización por retiro anticipado</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Emergencias médicas o personales comprobadas</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Desempleo o pérdida de ingresos</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Fallecimiento del titular</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Compra de vivienda o educación</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Acuerdo previo al contratar el depósito</span>
          </li>
          <li className="flex items-start">
            <span className="text-[#1C3B5A] mr-3">•</span>
            <span className="text-gray-700">Montos parciales según condiciones del contrato</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
