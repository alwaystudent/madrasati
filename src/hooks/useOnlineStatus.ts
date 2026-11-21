import { useEffect, useState } from 'react';

export interface ConnectivityState {
  isOnline: boolean;
  justReconnected: boolean;
  lastChangedAt: string | null;
}

export function useConnectivityState(): ConnectivityState {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);

  useEffect(() => {
    let reconnectTimer: number | undefined;

    const handleOnline = () => {
      setIsOnline((prev) => {
        if (!prev) {
          setJustReconnected(true);
          window.clearTimeout(reconnectTimer);
          reconnectTimer = window.setTimeout(() => {
            setJustReconnected(false);
          }, 5000);
        }
        return true;
      });
      setLastChangedAt(new Date().toISOString());
    };

    const handleOffline = () => {
      window.clearTimeout(reconnectTimer);
      setJustReconnected(false);
      setIsOnline(false);
      setLastChangedAt(new Date().toISOString());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.clearTimeout(reconnectTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    justReconnected,
    lastChangedAt,
  };
}

export function useOnlineStatus(): boolean {
  const { isOnline } = useConnectivityState();
  return isOnline;
}
