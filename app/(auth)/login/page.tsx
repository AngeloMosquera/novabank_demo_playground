"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import { Logo } from "@/components/logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulación de inicio de sesión
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5fa] to-white flex flex-col justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1C3B5A]">Bienvenido de nuevo</h1>
            <p className="text-gray-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Correo electrónico o número de teléfono"
              type="text"
              placeholder="ejemplo@correo.com"
              icon={<Mail size={18} />}
              required
            />

            <Input label="Contraseña" type="password" placeholder="••••••••" icon={<Lock size={18} />} required />

            <div className="flex items-center justify-between">
              <Checkbox label="Recordarme" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />

              <Link href="/forgot-password" className="text-sm text-[#1C3B5A] hover:text-[#DEA742] font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              ¿Nuevo aquí?{" "}
              <Link href="/register" className="text-[#1C3B5A] font-medium hover:text-[#DEA742]">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
