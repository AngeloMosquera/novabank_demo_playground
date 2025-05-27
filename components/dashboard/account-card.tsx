import { CreditCard, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AccountCardProps {
  type: "savings" | "credit"
  name: string
  number: string
  balance: number
  currency?: string
  limit?: number
}

export function AccountCard({ type, name, number, balance, currency = "MXN", limit }: AccountCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const maskedNumber = number.replace(/\d(?=\d{4})/g, "•")

  return (
    <Card
      className={`overflow-hidden ${type === "savings" ? "bg-gradient-to-r from-[#1C3B5A] to-[#2a5580]" : "bg-gradient-to-r from-[#DEA742] to-[#e8c078]"}`}
    >
      <CardContent className="p-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white text-sm opacity-80">{name}</p>
            <p className="text-white font-mono mt-1">{maskedNumber}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${type === "savings" ? "bg-white/20" : "bg-white/20"}`}
          >
            {type === "savings" ? (
              <DollarSign size={20} className="text-white" />
            ) : (
              <CreditCard size={20} className="text-white" />
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-white text-sm opacity-80">{type === "savings" ? "Saldo disponible" : "Saldo actual"}</p>
          <p className="text-white text-2xl font-bold mt-1">{formatCurrency(balance)}</p>

          {type === "credit" && limit && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/80">
                <span>Límite: {formatCurrency(limit)}</span>
                <span>Disponible: {formatCurrency(limit - balance)}</span>
              </div>
              <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${(balance / limit) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
