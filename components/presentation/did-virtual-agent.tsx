"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { VoiceRecognition } from "./voice-recognition"

interface DIDVirtualAgentProps {
  apiKey: string
  sessionId?: string
  onSessionStart?: (sessionId: string) => void
  onSessionEnd?: () => void
}

export function DIDVirtualAgent({ apiKey, sessionId, onSessionStart, onSessionEnd }: DIDVirtualAgentProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
  const [streamId, setStreamId] = useState<string | null>(null)
  const [isStreamReady, setIsStreamReady] = useState(false)
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastBytesReceivedRef = useRef<number>(0)
  const videoIsPlayingRef = useRef<boolean>(false)

  // Configuración del presentador
  const presenterConfig = {
    presenter_id: "v2_public_alyssa_red_suite_green_screen@46XonMxLFm",
    driver_id: "LRjggU94ze",
    stream_warmup: true
  }

  // Crear conexión peer
  const createPeerConnection = async (offer: RTCSessionDescriptionInit, iceServers: RTCIceServer[]) => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection({ iceServers })
    }

    const peerConnection = peerConnectionRef.current

    peerConnection.addEventListener('track', onTrack)
    peerConnection.addEventListener('icecandidate', onIceCandidate)
    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log('ICE gathering state:', peerConnection.iceGatheringState)
    })
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', peerConnection.connectionState)
    })

    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    return answer
  }

  // Manejar candidatos ICE
  const onIceCandidate = async (event: RTCPeerConnectionIceEvent) => {
    if (!streamId || !currentSessionId) return

    const body = event.candidate ? {
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex,
      session_id: currentSessionId,
    } : {
      session_id: currentSessionId,
    }

    try {
      await fetch(`https://api.d-id.com/clips/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch (err) {
      console.error('Error enviando candidato ICE:', err)
    }
  }

  // Manejar track de video
  const onTrack = (event: RTCTrackEvent) => {
    if (!event.track || !videoRef.current) return

    console.log('Recibido track:', event.track.kind)

    if (event.track.kind === 'video') {
      videoRef.current.srcObject = event.streams[0]
      
      // Monitorear estadísticas del video
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current)
      }

      statsIntervalRef.current = setInterval(async () => {
        if (peerConnectionRef.current) {
          const stats = await peerConnectionRef.current.getStats(event.track)
          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              const videoStatusChanged = videoIsPlayingRef.current !== (report.bytesReceived > lastBytesReceivedRef.current)

              if (videoStatusChanged) {
                videoIsPlayingRef.current = report.bytesReceived > lastBytesReceivedRef.current
                console.log('Estado del video:', videoIsPlayingRef.current ? 'reproduciendo' : 'parado')
              }
              lastBytesReceivedRef.current = report.bytesReceived
            }
          })
        }
      }, 500)
    }
  }

  // Inicializar la sesión de D-ID
  const initializeSession = async () => {
    if (isInitializing || isStreaming) return
    
    setIsInitializing(true)
    setError(null)
    
    try {
      // Crear stream
      const response = await fetch("https://api.d-id.com/clips/streams", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...presenterConfig,
          background: { color: '#FFFFFF' }
        }),
      })

      if (!response.ok) {
        throw new Error("Error al inicializar la sesión de D-ID")
      }

      const data = await response.json()
      const newStreamId = data.id
      const newSessionId = data.session_id
      
      setStreamId(newStreamId)
      setCurrentSessionId(newSessionId)
      onSessionStart?.(newSessionId)

      console.log('Stream creado:', { streamId: newStreamId, sessionId: newSessionId })

      // Crear conexión WebRTC
      const sessionClientAnswer = await createPeerConnection(data.offer, data.ice_servers)

      // Enviar SDP answer
      const sdpResponse = await fetch(`https://api.d-id.com/clips/streams/${newStreamId}/sdp`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: sessionClientAnswer,
          session_id: newSessionId,
        }),
      })

      if (!sdpResponse.ok) {
        throw new Error('Error al configurar SDP')
      }

      setIsStreaming(true)
      setIsInitializing(false)
      
      // Marcar stream como listo después de un tiempo
      setTimeout(() => {
        setIsStreamReady(true)
      }, 2000)

    } catch (err) {
      console.error("Error al inicializar D-ID:", err)
      setError("Error al inicializar el agente virtual")
      setIsInitializing(false)
    }
  }

  // Enviar mensaje al agente
  const sendMessage = async (text: string) => {
    if (!streamId || !currentSessionId || !isStreamReady) {
      setError("El agente virtual no está listo")
      return
    }

    try {
      const response = await fetch(`https://api.d-id.com/clips/streams/${streamId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            subtitles: 'false',
            provider: {
              type: 'microsoft',
              voice_id: 'es-ES-ElviraNeural',
            },
            input: text,
          },
          config: { 
            stitch: true,
            fluent: true 
          },
          session_id: currentSessionId,
          background: { color: '#FFFFFF' }
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      console.log('Mensaje enviado:', text)

    } catch (err) {
      console.error("Error al enviar mensaje:", err)
      setError("Error al comunicarse con el agente virtual")
    }
  }

  // Manejar el reconocimiento de voz
  const handleSpeechRecognized = (text: string) => {
    sendMessage(text)
  }

  // Limpiar recursos
  const cleanup = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Inicializar sesión cuando el componente se monta
  useEffect(() => {
    if (apiKey && !currentSessionId) {
      initializeSession()
    }
  }, [apiKey])

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      cleanup()
      onSessionEnd?.()
    }
  }, [])

  return (
    <div className="h-full w-full flex items-end justify-center bg-white relative overflow-hidden">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg max-w-[80%] z-10"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {isInitializing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Iniciando agente virtual...</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.7 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <video
          ref={videoRef}
          className={`w-full h-full max-w-full max-h-full object-contain object-center transition-opacity duration-300 ${
            isStreamReady ? "opacity-100" : "opacity-50"
          }`}
          autoPlay
          playsInline
          muted={false}
          controls={false}
          preload="auto"
          webkit-playsinline="true"
          x5-playsinline="true"
          style={{
            backgroundColor: 'transparent',
          }}
          onLoadStart={() => console.log("Video load started")}
          onLoadedData={() => console.log("Video data loaded")}
          onCanPlay={() => console.log("Video can play")}
          onPlaying={() => console.log("Video is playing")}
          onError={(e) => {
            console.error("Video error:", e)
            const target = e.target as HTMLVideoElement
            if (target.error) {
              console.error("Video error details:", target.error.message)
            }
          }}
        />
      </motion.div>

      {/* Botón de micrófono */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
        <VoiceRecognition onSpeechRecognized={handleSpeechRecognized} />
      </div>

      {/* Botón para reinicializar si hay error */}
      {error && (
        <div className="absolute bottom-4 left-4">
          <button
            onClick={initializeSession}
            disabled={isInitializing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isInitializing ? "Iniciando..." : "Reintentar"}
          </button>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-4 text-xs text-gray-500 bg-white bg-opacity-80 p-2 rounded">
          <div>Stream ID: {streamId}</div>
          <div>Session ID: {currentSessionId}</div>
          <div>Stream Ready: {isStreamReady ? 'Yes' : 'No'}</div>
          <div>Connection: {peerConnectionRef.current?.connectionState || 'None'}</div>
        </div>
      )}
    </div>
  )
} 