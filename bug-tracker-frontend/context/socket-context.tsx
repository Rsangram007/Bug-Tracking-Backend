"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
})

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Create socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: {
        token,
      },
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setConnected(true)

      // Join user's room for notifications
      socketInstance.emit("join", user.id)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user, token])

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}

