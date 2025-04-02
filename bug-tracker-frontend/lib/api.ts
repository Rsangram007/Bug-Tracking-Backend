import axios from 'axios';
import { setCookie } from "cookies-next";
import type { Bug } from "@/types/bug";
import type { User } from "@/types/user";
import type { Notification } from "@/types/notification";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

console.log("API_URL:", API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Auth API
export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', {
      email,
      password
    });

    // Set token in cookie for SSR
    setCookie("token", response.data.token, { maxAge: 60 * 60 });
    return response.data;
  } catch (error) {
    console.error("Login error details:", error);

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          `Cannot connect to server at ${API_URL}. Please check your API URL and network connection.`
        );
      }

      const errorMessage = error.response?.data?.error || 
        `Login failed with status: ${error.response?.status}`;
      
      if (error.response.status === 404) {
        throw new Error(
          `API endpoint not found. The server is running but the login endpoint may be at a different path.`
        );
      }

      throw new Error(errorMessage);
    }

    throw error;
  }
};

// Modified function to test API connectivity
export const testApiConnection = async () => {
  try {
    // Test auth endpoint
    const authResponse = await axiosInstance.get('/api/auth/login');
    
    // Test bugs endpoint
    const bugsResponse = await axiosInstance.get('/api/bugs');
    
    return {
      authConnected: authResponse.status >= 200 && authResponse.status < 300,
      bugsConnected: bugsResponse.status >= 200 && bugsResponse.status < 300,
      message: "API connection tests completed",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        authConnected: false,
        bugsConnected: false,
        error: error.response?.data?.error || error.message,
        message: "Cannot connect to API endpoints"
      };
    }
    return {
      authConnected: false,
      bugsConnected: false,
      error: "Unknown error",
      message: "Cannot connect to API endpoints"
    };
  }
};

// Bug API
export const fetchBugs = async (): Promise<Bug[]> => {
  try {
    const response = await axiosInstance.get('/api/bugs', {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch bugs: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to fetch bugs");
  }
};

export const fetchBugById = async (id: string): Promise<Bug> => {
  try {
    const response = await axiosInstance.get(`/api/bugs/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch bug: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to fetch bug");
  }
};

export const reportBug = async (formData: FormData): Promise<Bug> => {
  try {
    const response = await axiosInstance.post('/api/bugs/report', formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to report bug: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to report bug");
  }
};

export const updateBugStatus = async (
  bugId: string,
  status: string,
  fixDescription: string
): Promise<Bug> => {
  try {
    const response = await axiosInstance.put(`/api/bugs/${bugId}/status`, 
      { status, fixDescription },
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to update bug status: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to update bug status");
  }
};

export const verifyBug = async (
  bugId: string,
  status: string,
  comment: string
): Promise<Bug> => {
  try {
    const response = await axiosInstance.put(`/api/bugs/${bugId}/verify`, 
      { status, comment },
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to verify bug: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to verify bug");
  }
};

export const assignBug = async (
  bugId: string,
  developerId: string
): Promise<Bug> => {
  const response = await fetch(`${API_URL}/api/admin/bugs/${bugId}/assign`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ developerId }),
    credentials: "include",
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error("Failed to assign bug");
  }

  return response.json();
};

// User API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get('/api/admin/users', {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch users: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to fetch users");
  }
};

export const addUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> => {
  try {
    const response = await axiosInstance.post('/api/admin/users', userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to add user: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to add user");
  }
};

// Notification API
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await axiosInstance.get('/api/notifications', {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch notifications: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to fetch notifications");
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification> => {
  try {
    const response = await axiosInstance.put(
      `/api/notifications/${notificationId}/read`,
      null,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to mark notification as read: ${error.response?.data?.error || error.message}`);
    }
    throw new Error("Failed to mark notification as read");
  }
};
