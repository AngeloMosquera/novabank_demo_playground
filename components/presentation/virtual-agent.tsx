"use client"

import { useState, useRef, useEffect } from "react"
import { StreamingAgent } from "./streaming-agent"
import { VoiceRecognition } from "./voice-recognition"
import { useRouter } from "next/navigation"

// Logger utility
const Logger = {
  info: (message: string, data?: any) => {
    console.log(`[VirtualAgent] ℹ️ ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    console.error(`[VirtualAgent] ❌ ${message}`, error || '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[VirtualAgent] ⚠️ ${message}`, data || '')
  },
  debug: (message: string, data?: any) => {
    console.debug(`[VirtualAgent] 🔍 ${message}`, data || '')
  },
  success: (message: string, data?: any) => {
    console.log(`[VirtualAgent] ✅ ${message}`, data || '')
  }
}

export function VirtualAgent() {
  const [isStreamReady, setIsStreamReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected')
  const streamingAgentRef = useRef<{ sendMessage: (text: string) => void }>(null)
  const router = useRouter()
  const isMountedRef = useRef(true)

  const handleStreamReady = () => {
    if (!isMountedRef.current) return
    Logger.info('Stream listo para recibir mensajes')
    setIsStreamReady(true)
    setConnectionState('connected')
    setError(null) // Clear any previous errors when connection is successful
  }

  const handleStreamError = (error: string) => {
    if (!isMountedRef.current) return
    
    // In development, WebRTC errors during strict mode are expected
    if (process.env.NODE_ENV === 'development' && 
        (error.includes('setRemoteDescription') || error.includes('m-lines') || error.includes('inicializar'))) {
      Logger.warn('Error de desarrollo detectado (React Strict Mode), ignorando', { error })
      return
    }
    
    Logger.error('Error en el stream', { error })
    setError(error)
    setConnectionState('error')
  }

  const handleSpeechRecognized = async (text: string) => {
    if (!isMountedRef.current) return
    
    try {
      Logger.info('Transcripción recibida', { text })

      // Enviar la transcripción a OpenAI
      Logger.debug('Enviando transcripción a OpenAI')
      const openaiResponse = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        })
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        Logger.error('Error al procesar con OpenAI', {
          status: openaiResponse.status,
          error: errorText
        })
        throw new Error(`Error al procesar con OpenAI: ${openaiResponse.status} - ${errorText}`)
      }

      const result = await openaiResponse.json()
      Logger.info('Respuesta de OpenAI recibida', result)

      // Enviar respuesta al avatar
      if (result.response && streamingAgentRef.current && isMountedRef.current) {
        const { text: responseText, page, reason } = result.response
        
        Logger.debug('Enviando respuesta al avatar', { 
          text: responseText,
          page,
          reason
        })

        // Enviar el texto al avatar
        streamingAgentRef.current.sendMessage(responseText)
        Logger.success('Respuesta enviada al avatar')

        // Navegar a la página correspondiente
        Logger.info('Navegando a página', { page, reason })
        router.push(`/${page}`)
      } else {
        Logger.warn('Respuesta de OpenAI sin datos esperados', { result })
      }
    } catch (err) {
      if (isMountedRef.current) {
        Logger.error('Error al procesar la transcripción', err)
        setError("Error al procesar la solicitud")
      }
    }
  }

  // Log cuando el componente se monta
  useEffect(() => {
    Logger.info('Componente VirtualAgent montado')
    isMountedRef.current = true
    
    return () => {
      Logger.info('Componente VirtualAgent desmontado')
      isMountedRef.current = false
    }
  }, [])

  // Log cuando cambia el estado de error (solo en development con errores reales)
  useEffect(() => {
    if (error && isMountedRef.current) {
      // Only log real errors, not development-related ones
      if (!(process.env.NODE_ENV === 'development' && 
            (error.includes('setRemoteDescription') || error.includes('m-lines')))) {
        Logger.error('Error actualizado', { error })
      }
    }
  }, [error])

  // Log cuando cambia el estado de stream
  useEffect(() => {
    if (isMountedRef.current) {
      Logger.debug('Estado del stream actualizado', { isStreamReady })
    }
  }, [isStreamReady])

  return (
    <div className="h-full w-full flex items-end justify-center bg-white relative">
      {/* Show errors only in production or for real errors */}
      {error && process.env.NODE_ENV === 'production' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg max-w-[80%] z-10">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <StreamingAgent
        ref={streamingAgentRef}
        apiKey={process.env.NEXT_PUBLIC_DID_API_KEY || ""}
        onStreamReady={handleStreamReady}
        onStreamError={handleStreamError}
      />

      {/* Botón de micrófono */}
      {isStreamReady && (
        <div className="absolute bottom-6 right-6">
          <VoiceRecognition onSpeechRecognized={handleSpeechRecognized} />
        </div>
      )}
    </div>
  )
}
