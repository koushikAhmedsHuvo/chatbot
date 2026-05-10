// frontend/src/lib/axios.js
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
    // baseURL: API_URL,
  withCredentials: true, // This is IMPORTANT for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);