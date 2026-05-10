// frontend/src/hooks/useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket = null;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found - user may not be logged in");
      return;
    }

    if (socket && socket.connected) {
      setSocketInstance(socket);
      setIsConnected(true);
      return;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setSocketInstance(socket);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket: socketInstance, isConnected };
};
