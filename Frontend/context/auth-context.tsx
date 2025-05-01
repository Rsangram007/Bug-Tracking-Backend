"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"
import { setCookie, deleteCookie } from "cookies-next"
import axios from "axios"

interface AuthContextType {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Check for stored user and token in localStorage
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")

      if (storedUser && storedToken) {
        // Verify token validity before setting auth state
        const verifyToken = async () => {
          try {
            const response = await axios.post('/api/auth/verify-token', { token: storedToken })
            if (response.status === 200) {
              setUser(JSON.parse(storedUser))
              setToken(storedToken)
            } else {
              // Clear invalid token
              localStorage.removeItem("user")
              localStorage.removeItem("token")
              deleteCookie("token")
            }
          } catch (error) {
            console.error("Token verification failed:", error)
            // Clear invalid token
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            deleteCookie("token")
          }
        }
        verifyToken()
      }
    } catch (error) {
      console.error("Error loading auth from localStorage:", error)
      // Clear potentially corrupted data
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      // Update localStorage when user or token changes
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        localStorage.removeItem("user")
      }

      if (token) {
        localStorage.setItem("token", token)
        setCookie("token", token, { maxAge: 60 * 60 }) // 1 hour
      } else {
        localStorage.removeItem("token")
        deleteCookie("token")
      }
    } catch (error) {
      console.error("Error saving auth to localStorage:", error)
    }
  }, [user, token])

  const logout = () => {
    setUser(null)
    setToken(null)
    router.push("/")
  }

  if (loading) {
    return null // Or a loading spinner
  }

  return <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>{children}</AuthContext.Provider>
}

