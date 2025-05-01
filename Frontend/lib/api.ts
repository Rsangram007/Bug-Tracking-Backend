import { setCookie } from "cookies-next";
import axios from "axios";
import type { Bug } from "@/types/bug";
import type { User } from "@/types/user";
import type { Notification } from "@/types/notification";

// Update to use the hosted backend URL
const API_URL = "https://bug-tracking-app.onrender.com" ;
// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for CORS with cookies
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  // Fallback to cookies if localStorage token is not available (for SSR)
  if (typeof window !== "undefined" && !token) {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("token="));
    if (tokenCookie) {
      token = tokenCookie.split("=")[1];
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    const data = response.data;

    // Set token in cookie for SSR
    setCookie("token", data.token, { maxAge: 60 * 60 }); // 1 hour

    return data;
  } catch (error) {
    console.error("Login error details:", error);

    if (axios.isAxiosError(error)) {
      // Check if we have a response from the server
      if (error.response) {
        const errorMessage =
          error.response.data?.error ||
          `Login failed with status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(
          "No response received from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request
        throw new Error(`Request error: ${error.message}`);
      }
    }

    // For non-Axios errors
    throw new Error(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

// Bug API
export const fetchBugs = async (): Promise<Bug[]> => {
  try {
    let token = localStorage.getItem("token");

    // Fallback to cookies if localStorage token is not available (for SSR)
    if (typeof window !== "undefined" && !token) {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((row) => row.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }

    if (!token) {
      // More descriptive error message with guidance
      throw new Error(
        "Authentication required. Please login to access this feature."
      );
    }

    const response = await api.get("/api/bugs");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Session expired. Please login again.");
      } else if (error.response?.status === 404) {
        throw new Error("Bugs endpoint not found");
      } else if (error.response?.status === 500) {
        throw new Error("Server error occurred while fetching bugs");
      }
      throw new Error(error.response?.data?.error || "Failed to fetch bugs");
    } else if (error instanceof Error) {
      // More user-friendly error message
      if (error.message.includes("Authentication required")) {
        throw error;
      }
      throw new Error(
        `Network error: ${error.message}. Please check your connection and try again.`
      );
    }
    throw new Error("An unknown error occurred while fetching bugs");
  }
};
export const fetchBugById = async (id: string): Promise<Bug> => {
  try {
    const response = await api.get(`/api/bugs/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to fetch bug");
    }
    throw error;
  }
};

export const reportBug = async (formData: FormData): Promise<Bug> => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      formData.append(
        "createdBy",
        JSON.parse(atob(token.split(".")[1])).userId
      );
    }
    const response = await api.post("/api/bugs/report", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to report bug");
    }
    throw error;
  }
};

export const updateBugStatus = async (
  bugId: string,
  status: string,
  fixDescription: string
): Promise<Bug> => {
  try {
    const response = await api.put(`/api/bugs/${bugId}/status`, {
      status,
      fixDescription,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to update bug status"
      );
    }
    throw error;
  }
};

export const verifyBug = async (
  bugId: string,
  status: string,
  comment: string
): Promise<Bug> => {
  try {
    const response = await api.put(`/api/bugs/${bugId}/verify`, {
      status,
      comment,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to verify bug");
    }
    throw error;
  }
};

export const assignBug = async (
  bugId: string,
  developerId: string
): Promise<Bug> => {
  try {
    const response = await api.put(`/api/admin/bugs/${bugId}/assign`, {
      developerId,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to assign bug");
    }
    throw error;
  }
};

// User API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/api/admin/users");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    }
    throw error;
  }
};

export const addUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> => {
  try {
    const response = await api.post("/api/admin/users", userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Failed to add user");
    }
    throw error;
  }
};

// Notification API
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get("/api/notifications");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch notifications"
      );
    }
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification> => {
  if (!notificationId) {
    throw new Error("Notification ID is required");
  }
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to mark notification as read"
      );
    }
    throw error;
  }
};

// Add this function to the api.ts file

/**
 * Test API connection - Diagnostic function
 * This is a helper function to verify API connectivity during development.
 * Can be safely removed if not needed in production.
 */
export const testApiConnection = async (): Promise<{
  status: string;
  message: string;
}> => {
  try {
    const response = await api.get("/api/health");
    return {
      status: "success",
      message: `API is reachable. Server responded with: ${
        response.data?.message || "OK"
      }`,
    };
  } catch (error) {
    let errorMessage = "Unknown error";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response received from server";
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      status: "error",
      message: `API connection failed: ${errorMessage}`,
    };
  }
};
