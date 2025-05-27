"use client"

import { useState, useEffect, useRef } from "react"
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

interface VoiceRecognitionProps {
  onSpeechRecognized: (text: string) => void
  className?: string
}

interface DeepgramResponse {
  key: string;
  expires: number;
}

interface DeepgramTranscriptionData {
  channel: {
    alternatives: Array<{
      transcript: string;
      confidence: number;
    }>;
  };
  is_final: boolean;
}

interface DeepgramError {
  message?: string;
  type?: string;
  code?: string;
}

interface AudioRecorderProps {
  sendMessageToAvatar?: (text: string) => Promise<void>;
  isStreamReady?: boolean;
}

export function VoiceRecognition({ onSpeechRecognized, className }: VoiceRecognitionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const deepgramConnectionRef = useRef<any>(null); // Live connection type not exported
  const finalTranscriptRef = useRef<string>('');
  const navigationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const deepgramClientRef = useRef<any>(null); // DeepgramClient type not exported
  const audioBufferRef = useRef<Blob[]>([]);
  const connectionReadyRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (deepgramConnectionRef.current) {
        deepgramConnectionRef.current.finish();
      }
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const getDeepgramKey = async (): Promise<string> => {
    try {
      const response = await fetch('/api/deepgram');
      if (!response.ok) {
        throw new Error('Error al obtener la clave de Deepgram');
      }
      const data: DeepgramResponse = await response.json();
      return data.key;
    } catch (error) {
      console.error('Error al obtener la clave de Deepgram:', error);
      throw error;
    }
  };

  const setupDeepgramConnection = async () => {
    try {
      // Get Deepgram API key
      const deepgramKey = await getDeepgramKey();
      
      // Create Deepgram client
      deepgramClientRef.current = createClient(deepgramKey);

      // Create live transcription connection with nova-2 model
      const connection = deepgramClientRef.current.listen.live({
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true,
      });

      deepgramConnectionRef.current = connection;

      // Set up event handlers
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Conexión con Deepgram establecida');
        setIsConnecting(false);
        connectionReadyRef.current = true;
        
        // Send any buffered audio data
        if (audioBufferRef.current.length > 0) {
          console.log('Enviando audio almacenado en buffer...');
          audioBufferRef.current.forEach(audioBlob => {
            if (connection.getReadyState() === 1) {
              connection.send(audioBlob);
            }
          });
          audioBufferRef.current = []; // Clear buffer
        }
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data: DeepgramTranscriptionData) => {
        console.log('Transcripción recibida:', data);
        
        if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
          const transcript = data.channel.alternatives[0].transcript;
          
          if (transcript && transcript.trim()) {
            console.log('Transcripción:', transcript);
            
            // If this is a final result, store it
            if (data.is_final) {
              finalTranscriptRef.current += transcript + ' ';
              console.log('Transcripción final acumulada:', finalTranscriptRef.current);
            }
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (error: DeepgramError) => {
        console.error('Error en Deepgram:', error);
        setError(`Error en la transcripción: ${error.message || 'Error desconocido'}`);
        stopRecording();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Conexión con Deepgram cerrada');
        setIsRecording(false);
        setIsConnecting(false);
        connectionReadyRef.current = false;
        
        // Process the final transcript
        if (finalTranscriptRef.current.trim()) {
          console.log('Procesando transcripción final:', finalTranscriptRef.current.trim());
          onSpeechRecognized(finalTranscriptRef.current.trim())
        }
      });

    } catch (error) {
      console.error('Error al configurar conexión Deepgram:', error);
      setError('Error al conectar con el servicio de transcripción. Por favor, intenta de nuevo.');
      setIsConnecting(false);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      setIsRecording(true);
      finalTranscriptRef.current = '';
      audioBufferRef.current = [];
      connectionReadyRef.current = false;

      // Start microphone recording immediately
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      mediaStreamRef.current = stream;

      // Start recording audio immediately
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          if (connectionReadyRef.current && deepgramConnectionRef.current && deepgramConnectionRef.current.getReadyState() === 1) {
            // Connection is ready, send immediately
            deepgramConnectionRef.current.send(event.data);
          } else {
            // Buffer the audio data until connection is ready
            audioBufferRef.current.push(event.data);
            console.log('Audio almacenado en buffer, esperando conexión...');
          }
        }
      };

      // Start recording immediately with 250ms chunks
      mediaRecorder.start(250);
      console.log('Grabación iniciada inmediatamente');

      // Setup Deepgram connection in parallel
      setupDeepgramConnection().catch((error) => {
        console.error('Error al configurar Deepgram:', error);
        setError('Error al conectar con el servicio de transcripción. Por favor, intenta de nuevo.');
        setIsRecording(false);
        setIsConnecting(false);
      });

    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      setError('Error al acceder al micrófono. Por favor, intenta de nuevo.');
      setIsRecording(false);
      setIsConnecting(false);
    }
  };

  const stopRecording = () => {
    console.log('Deteniendo grabación...');
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close Deepgram connection
    if (deepgramConnectionRef.current) {
      deepgramConnectionRef.current.finish();
      deepgramConnectionRef.current = null;
    }

    // Clear buffers
    audioBufferRef.current = [];
    connectionReadyRef.current = false;

    setIsRecording(false);
    setIsConnecting(false);
  };

  const getButtonClass = () => {
    if (isRecording) return 'record-button recording';
    return 'record-button idle';
  };

  const getStatusText = () => {
    if (isRecording) return 'Grabando...';
    return '';
  };

  const getButtonColor = () => {
    // Only show recording or not recording - hide connection state from user
    if (isRecording) return 'bg-red-600 hover:bg-red-700 animate-pulse';
    return 'bg-blue-900 hover:bg-blue-800';
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={false} // Never disable the button
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getButtonColor()}`}
        >
          {isRecording ? (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
        
        {isRecording && (
          <div className="flex items-center gap-0">
            {/* <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div> */}
            {/* <span className="text-sm text-gray-600">{getStatusText()}</span> */}
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Procesando...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2 max-w-md text-center">
          {error}
        </div>
      )}

    </div>
  );
}
