"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

// Import the API_URL from the api.ts file or define it here
import axios from "axios";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://bug-tracking-backend.onrender.com";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  loading: false,
  error: null,
}); 

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, setToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || typeof decoded === 'string') return true;
      return (decoded.exp || 0) * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const handleTokenRefresh = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, null, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setConnectionAttempts(0);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Check token expiration before attempting connection
    if (isTokenExpired(token)) {
      console.log('Token expired, attempting refresh...');
      handleTokenRefresh();
      return;
    }

    // Create socket connection with the hosted URL
    const socketInstance = io(API_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);

      // Join user's room for notifications
      socketInstance.emit("join", user.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    setLoading(true);
    setError(null);

    socketInstance.on("connect_error", async (err) => {
      console.error("Socket connection error:", err);
      setConnected(false);
      setLoading(false);
      
      // Show more descriptive error messages
      if (err.message.includes("Invalid token")) {
        setError("Session expired. Refreshing token...");
      } else if (err.message.includes("CORS")) {
        setError("Server connection issue. Please try again later.");
      } else {
        setError(err.message);
      }

      // Handle specific error cases
      if (err.message.includes("Invalid token")) {
        console.error("Token expired or invalid. Attempting to refresh...");
        // Add retry delay before refreshing token
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Attempt to refresh token first
        try {
          const response = await axios
            .post(`${API_URL}/api/auth/refresh-token`, null, {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
            .catch((err) => {
              console.error("Refresh token request failed:", err);
              if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
                setError("Server connection error. Please check your internet connection or contact support.");
              }
              return null;
            });

          if (response?.status === 200) {
            setToken(response.data.token);
            setConnectionAttempts(0);
            // Update localStorage with new token
            localStorage.setItem("token", response.data.token);
            return;
          }

          // If refresh fails with 404 or network error, handle appropriately
          if (!response || response?.status === 404) {
            setError("Token refresh not available. Please login again.");
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Use wind(ow location to avoid hook issues
            window.location.href = "/";
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        // Clear invalid token if refresh failed
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        deleteCookie("token");

        // Redirect to login if we've exhausted retries
        if (connectionAttempts >= 3) {
          window.location.href = "/auth/login";
        } else {
          // Add exponential backoff for retry attempts
          const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
          setTimeout(() => {
            setConnectionAttempts((prev) => prev + 1);
          }, retryDelay);
        }
      } else if (err.message.includes("Authentication error")) {
        console.error("Authentication required. Please login first.");
        setError("Authentication required");
        window.location.href = "/";
      } else {
        // For other errors, retry connection after delay
        setError("Connection error. Retrying...");
        setTimeout(() => {
          setConnectionAttempts((prev) => prev + 1);
        }, 2000);
      }
    });

    setSocket(socketInstance);
    setConnectionAttempts(0);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token, connectionAttempts]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        loading,
        error,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
