// frontend/src/lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chatbot-mmwj.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Or wherever the token is stored
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
