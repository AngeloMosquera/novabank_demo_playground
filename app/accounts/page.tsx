"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, CreditCard, DollarSign, Wallet, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BackButton } from "@/components/navigation/back-button"

// Datos de ejemplo
const accounts = [
  {
    id: "savings-1",
    type: "savings" as const,
    name: "Cuenta de Ahorros Principal",
    number: "4552 **** **** 7895",
    balance: 45678.9,
    currency: "MXN",
    interestRate: 3.5,
  },
  {
    id: "checking-1",
    type: "checking" as const,
    name: "Cuenta Corriente",
    number: "4552 **** **** 4321",
    balance: 12500.75,
    currency: "MXN",
  },
  {
    id: "credit-1",
    type: "credit" as const,
    name: "Tarjeta Oro",
    number: "5412 **** **** 3456",
    balance: 12500.75,
    currency: "MXN",
    limit: 50000,
    availableCredit: 37499.25,
  },
]

export default function AccountsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "savings" | "checking" | "credit">("all")

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getAccountIcon = (type: "savings" | "checking" | "credit") => {
    switch (type) {
      case "savings":
        return <DollarSign size={20} className="text-white" />
      case "checking":
        return <Wallet size={20} className="text-white" />
      case "credit":
        return <CreditCard size={20} className="text-white" />
    }
  }

  const getAccountGradient = (type: "savings" | "checking" | "credit") => {
    switch (type) {
      case "savings":
        return "from-[#1C3B5A] to-[#2a5580]"
      case "checking":
        return "from-[#2a5580] to-[#3a6590]"
      case "credit":
        return "from-[#DEA742] to-[#e8c078]"
    }
  }

  const getAccountTypeName = (type: "savings" | "checking" | "credit") => {
    switch (type) {
      case "savings":
        return "Cuenta de Ahorros"
      case "checking":
        return "Cuenta Corriente"
      case "credit":
        return "Tarjeta de Crédito"
    }
  }

  const filteredAccounts = accounts.filter((account) => filter === "all" || account.type === filter)

  // Calculate totals
  const totals = accounts.reduce(
    (acc, account) => {
      if (account.type === "credit") {
        acc.debt += account.balance
      } else {
        acc.balance += account.balance
      }
      return acc
    },
    { balance: 0, debt: 0 },
  )

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-screen-xl mx-auto">
      <div>
        {/* Usar el componente BackButton */}
        <BackButton />
        <h1 className="text-2xl font-bold text-[#1C3B5A]">Tus Cuentas</h1>
        <p className="text-gray-500">Administra tus cuentas y tarjetas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-r from-[#1C3B5A] to-[#2a5580] text-white">
          <CardContent className="p-4 md:p-5">
            <p className="text-sm text-white/80">Saldo total</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.balance, "MXN")}</p>
            <p className="text-xs text-white/60 mt-2">En cuentas de ahorro y corriente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#DEA742] to-[#e8c078] text-white">
          <CardContent className="p-4 md:p-5">
            <p className="text-sm text-white/80">Deuda total</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.debt, "MXN")}</p>
            <p className="text-xs text-white/60 mt-2">En tarjetas de crédito</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#4CAF50] to-[#81C784] text-white">
          <CardContent className="p-4 md:p-5">
            <p className="text-sm text-white/80">Balance neto</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.balance - totals.debt, "MXN")}</p>
            <p className="text-xs text-white/60 mt-2">Activos menos pasivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and add account */}
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              {filter === "all" ? "Todas las cuentas" : getAccountTypeName(filter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setFilter("all")}>Todas las cuentas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("savings")}>Cuentas de ahorro</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("checking")}>Cuentas corrientes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("credit")}>Tarjetas de crédito</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" leftIcon={<Plus size={16} />}>
          Agregar cuenta
        </Button>
      </div>

      {/* Accounts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {filteredAccounts.map((account) => (
          <Card
            key={account.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/accounts/${account.id}`)}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${getAccountGradient(account.type)} p-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-xs opacity-80">{getAccountTypeName(account.type)}</p>
                    <h3 className="text-white text-lg font-bold mt-1">{account.name}</h3>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    {getAccountIcon(account.type)}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-white text-xs opacity-80">Número de cuenta</p>
                  <p className="text-white font-mono text-sm">{account.number}</p>
                </div>

                <div className="mt-4">
                  <p className="text-white text-xs opacity-80">
                    {account.type === "credit" ? "Saldo actual" : "Saldo disponible"}
                  </p>
                  <p className="text-white text-xl font-bold mt-1">
                    {formatCurrency(account.balance, account.currency)}
                  </p>

                  {account.type === "credit" && account.limit && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-white/80">
                        <span>Límite: {formatCurrency(account.limit, account.currency)}</span>
                        <span>Disponible: {formatCurrency(account.availableCredit, account.currency)}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{ width: `${(account.balance / account.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {account.type === "savings" && account.interestRate
                      ? `Tasa de interés: ${account.interestRate}% anual`
                      : account.type === "credit"
                        ? "Toca para ver detalles y movimientos"
                        : "Toca para ver detalles y movimientos"}
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personalized recommendation */}
      <Card className="border-l-4 border-l-[#DEA742] mt-6 mb-4">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#f0f5fa] flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} className="text-[#1C3B5A]" />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#1C3B5A]">
                Carlos, optimiza tus finanzas con una estrategia personalizada
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Basado en tus hábitos financieros, te recomendamos distribuir tus fondos entre tus cuentas para
                maximizar beneficios y minimizar costos.
              </p>

              <Button variant="outline" size="sm" className="mt-3">
                Ver recomendación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
