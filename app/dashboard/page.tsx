"use client"

import { useState, useEffect } from "react"
import { TrendingUp, BookOpen, PiggyBank } from "lucide-react"
import { AccountCard } from "@/components/dashboard/account-card"
import { OpportunityCard } from "@/components/dashboard/opportunity-card"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { InvestmentSimulator } from "@/components/dashboard/investment-simulator"
import { PersonalizedRecommendation } from "@/components/dashboard/personalized-recommendation"
import { ContextualNotification } from "@/components/dashboard/contextual-notification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserActivity } from "@/hooks/use-user-activity"

// Datos de ejemplo
const transactions = [
  {
    id: "1",
    title: "Depósito recibido",
    description: "Transferencia de nómina",
    amount: 15000,
    type: "income" as const,
    category: "transfer" as const,
    date: "15 May, 2025",
  },
  {
    id: "2",
    title: "Supermercado La Comer",
    description: "Compras semanales",
    amount: 1250.75,
    type: "expense" as const,
    category: "shopping" as const,
    date: "14 May, 2025",
  },
  {
    id: "3",
    title: "Starbucks",
    description: "Café",
    amount: 85.5,
    type: "expense" as const,
    category: "food" as const,
    date: "14 May, 2025",
  },
  {
    id: "4",
    title: "Pago de hipoteca",
    description: "Mensualidad mayo",
    amount: 8500,
    type: "expense" as const,
    category: "housing" as const,
    date: "10 May, 2025",
  },
  {
    id: "5",
    title: "Pago de tarjeta",
    description: "Tarjeta Oro",
    amount: 5000,
    type: "expense" as const,
    category: "credit" as const,
    date: "05 May, 2025",
  },
]

export default function Dashboard() {
  const [isInvestmentSimulatorOpen, setIsInvestmentSimulatorOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showRecommendation, setShowRecommendation] = useState(true)
  const userName = "Carlos"

  const {
    userActivity,
    trackSectionView,
    trackInteraction,
    hasInterestIn,
    hasAvailableBalanceForInvestment,
    getInvestmentRecommendations,
    updatePreferences,
  } = useUserActivity()

  // Track dashboard view
  useEffect(() => {
    trackSectionView("dashboard")

    // Show contextual notification after a delay if user has interest in investments
    if (hasInterestIn("investments") && hasAvailableBalanceForInvestment()) {
      const timer = setTimeout(() => {
        setShowNotification(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Handle refresh - simulate data reload
  const handleRefresh = () => {
    setIsLoading(true)
    trackInteraction("refresh", "dashboard")

    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  // Handle when user clicks on a recommendation
  const handleRecommendationAction = () => {
    trackInteraction("click", "investment_recommendation")
    setIsInvestmentSimulatorOpen(true)
  }

  // Handle feedback on recommendations
  const handleRecommendationFeedback = (isHelpful: boolean) => {
    trackInteraction("feedback", isHelpful ? "positive" : "negative")
    updatePreferences({
      preferredInvestmentTypes: isHelpful ? ["time_deposit"] : [],
    })
  }

  return (
    <>
      <main className="container mx-auto px-0 py-0">
        {/* Tarjetas de cuentas - Ahora tercero */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-1 mb-1">
          <AccountCard
            type="savings"
            name="Cuenta de Ahorros"
            number="7895"
            balance={userActivity.financialContext.availableBalance}
          />

          <AccountCard type="credit" name="Tarjeta Oro" number="3456" balance={12500.75} limit={50000} />
        </div>

        {/* Sección de transacciones y resumen - Sigue siendo último */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionList transactions={transactions} />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumen financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ingresos (Mayo)</span>
                    <span className="text-sm font-medium text-[#1C3B5A]">$15,000.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Gastos (Mayo)</span>
                    <span className="text-sm font-medium text-[#1C3B5A]">$14,836.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className="text-sm font-medium text-green-600">+$163.75</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#DEA742]" style={{ width: "98.9%" }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0%</span>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>

                <div className="mt-4"></div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </main>

      {/* Notificación contextual */}
      {/* {showNotification && (
        <ContextualNotification
          message="Carlos, tenemos una estrategia de inversión que podría interesarte basada en tu actividad reciente."
          onDismiss={() => {
            setShowNotification(false)
            trackInteraction("dismiss", "contextual_notification")
          }}
          onAction={() => {
            setShowNotification(false)
            setIsInvestmentSimulatorOpen(true)
            trackInteraction("click", "contextual_notification")
          }}
        />
      )} */}

    </>
  )
}
