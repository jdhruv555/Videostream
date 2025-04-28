import { createContext, useState, useEffect, useCallback } from 'react';

interface WebSocketContextType {
    ws: WebSocket | null;
    isConnected: boolean;
    reconnect: () => void;
}

const WsContext = createContext<WebSocketContextType>({
    ws: null,
    isConnected: false,
    reconnect: () => {}
});

const WsState = ({ children }: { children: React.ReactNode }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 3000;

    const connect = useCallback(() => {
        if (typeof window === "undefined") return;

        try {
            const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_ENDPOINT);
            
            socket.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setRetryCount(0);
            };

            socket.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                
                // Attempt to reconnect if we haven't exceeded max retries
                if (retryCount < MAX_RETRIES) {
                    console.log(`Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        connect();
                    }, RETRY_DELAY);
                } else {
                    console.error('Max reconnection attempts reached');
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            setWs(socket);
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setIsConnected(false);
        }
    }, [retryCount]);

    const reconnect = useCallback(() => {
        if (ws) {
            ws.close();
        }
        setRetryCount(0);
        connect();
    }, [ws, connect]);

    useEffect(() => {
        connect();
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [connect]);

    return (
        <WsContext.Provider value={{ ws, isConnected, reconnect }}>
            {children}
        </WsContext.Provider>
    );
};

export {
    WsState,
    WsContext
};