import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Only connect if not already connected or connecting
    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (socket && !socket.connected) {
      // Reuse existing socket instance
      console.log('Reconnecting existing socket');
      socket.connect();
      return;
    }

    // Create new socket instance
    console.log('Creating new socket connection');
    const socketInstance = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: false, // Don't auto-connect
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);
    socketInstance.connect();
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket?.connected) {
      console.log('Disconnecting socket');
      socket.disconnect();
    }
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
