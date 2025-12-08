import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  topic: string | null
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  enabled?: boolean
}

export function useWebSocket({
  topic,
  onMessage,
  onError,
  enabled = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled || !topic) {
      return
    }

    // WebSocket URL из переменной окружения или дефолтное значение
    const wsBaseUrl = import.meta.env.VITE_WS_URL
    let wsUrl: string
    
    if (wsBaseUrl) {
      // Если указан полный URL WebSocket сервера
      wsUrl = `${wsBaseUrl}/ws?topic=${encodeURIComponent(topic)}`
    } else {
      // Фоллбэк: используем тот же хост с портом 3001
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.hostname
      wsUrl = `${protocol}//${host}:3001/ws?topic=${encodeURIComponent(topic)}`
    }
    
    console.log('🔌 Connecting to WebSocket:', wsUrl)

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      console.log('✅ WebSocket connected to topic:', topic)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        onMessage?.(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      onError?.(error)
    }

    ws.onclose = (event) => {
      setIsConnected(false)
      console.log('🔌 WebSocket disconnected:', event.code, event.reason)
      if (event.code !== 1000) {
        console.error('WebSocket closed with error code:', event.code, 'reason:', event.reason)
      }
    }

    wsRef.current = ws

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [topic, enabled, onMessage, onError])

  return {
    isConnected,
    lastMessage,
    send: (data: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data))
      }
    },
  }
}

