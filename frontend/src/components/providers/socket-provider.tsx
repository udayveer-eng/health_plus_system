"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Attempt to get token from localStorage (fallback if AuthContext isn't used directly here)
    const token = typeof window !== 'undefined' ? localStorage.getItem('healthpulse-token') : null;

    const socketInstance = io('http://localhost:5001', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      // In a real app, integrate with a toast library like sonner or react-hot-toast
      // e.g., toast(data.message);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Notification', { body: data.message || 'You have a new alert.' });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('notification');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
