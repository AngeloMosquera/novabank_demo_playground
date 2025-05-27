"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { InvestmentSimulator } from "@/components/dashboard/investment-simulator"
import { X, TrendingUp, Calendar, DollarSign, PiggyBank, HelpCircle, RefreshCw } from "lucide-react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/dashboard/navbar"

export default function InvestmentsPage() {
  const router = useRouter()
  const userName = "Carlos"
  const [amount, setAmount] = useState("10000")
  const [term, setTerm] = useState("12")
  const [risk, setRisk] = useState("medium") // low, medium, high
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userActivity, setUserActivity] = useState<{
    lastCalculation: number | null
    viewedProducts: string[]
    interactionCount: number
  }>({
    lastCalculation: null,
    viewedProducts: [],
    interactionCount: 0,
  })
  const [simulationCount, setSimulationCount] = useState(0)
  const [showPersonalizedTip, setShowPersonalizedTip] = useState(false)

  const calculateReturn = () => {
    const principal = Number.parseFloat(amount) || 0
    const months = Number.parseInt(term) || 0

    // Different rates based on risk profile
    const riskRates = {
      low: 0.06, // 6% anual
      medium: 0.095, // 9.5% anual
      high: 0.14, // 14% anual
    }

    const annualRate = riskRates[risk as keyof typeof riskRates]
    const monthlyRate = annualRate / 12

    const futureValue = principal * Math.pow(1 + monthlyRate, months)
    const interest = futureValue - principal

    // Potential future value with additional contributions
    const monthlyContribution = 1000
    const futureValueWithContributions =
      principal * Math.pow(1 + monthlyRate, months) +
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

    return {
      futureValue: futureValue.toFixed(2),
      interest: interest.toFixed(2),
      annualRate: (annualRate * 100).toFixed(2),
      potentialValue: futureValueWithContributions.toFixed(2),
    }
  }

  const { futureValue, interest, annualRate, potentialValue } = calculateReturn()

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-screen-xl mx-auto">
      <Navbar />
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between p-1 border-b">
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-semibold text-[#1C3B5A]">Simulador de Inversión</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-[#f0f5fa] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#1C3B5A]">
              <strong>{userName}</strong>, hemos personalizado este simulador basado en tu actividad reciente y perfil
              financiero.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1C3B5A] mb-2">Monto a invertir</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DEA742]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C3B5A] mb-2">Plazo (meses)</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DEA742] appearance-none bg-white"
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C3B5A] mb-2">Perfil de riesgo</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg border ${
                    risk === "low" ? "border-[#1C3B5A] bg-[#f0f5fa]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setRisk("low")}
                >
                  <span className="text-sm font-medium">Bajo</span>
                  <span className="text-xs text-gray-500">6% anual</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg border ${
                    risk === "medium" ? "border-[#1C3B5A] bg-[#f0f5fa]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setRisk("medium")}
                >
                  <span className="text-sm font-medium">Medio</span>
                  <span className="text-xs text-gray-500">9.5% anual</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg border ${
                    risk === "high" ? "border-[#1C3B5A] bg-[#f0f5fa]" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setRisk("high")}
                >
                  <span className="text-sm font-medium">Alto</span>
                  <span className="text-xs text-gray-500">14% anual</span>
                </button>
              </div>
            </div>

            <Card className="bg-[#f0f5fa] border-0">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tasa anual:</span>
                  <span className="text-sm font-medium text-[#1C3B5A]">{annualRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Interés estimado:</span>
                  <span className="text-sm font-medium text-[#1C3B5A]">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(Number.parseFloat(interest))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Monto al vencimiento:</span>
                  <span className="text-sm font-medium text-[#1C3B5A]">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(Number.parseFloat(futureValue))}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Potencial con aportaciones mensuales</span>
                      <HelpCircle size={14} className="ml-1 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(Number.parseFloat(potentialValue))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showPersonalizedTip && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle size={16} className="text-blue-400" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                leftIcon={isSubmitting ? undefined : <RefreshCw size={16} />}
              >
                {isSubmitting ? "Simulando..." : "Calcular rendimiento"}
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#1C3B5A] hover:text-[#DEA742] mt-2 text-sm"
                leftIcon={<PiggyBank size={16} />}
              >
                Invertir ahora
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
