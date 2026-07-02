import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoRefreshOptions {
  /** Interval in milliseconds between refreshes */
  intervalMs: number;
  /** The fetch/refresh function to call */
  onRefresh: () => Promise<void> | void;
  /** Whether to enable auto-refresh (default true) */
  enabled?: boolean;
  /** If true, won't refresh while the tab is hidden (default true) */
  pauseWhenHidden?: boolean;
}

export function useAutoRefresh({
  intervalMs,
  onRefresh,
  enabled = true,
  pauseWhenHidden = true,
}: UseAutoRefreshOptions) {
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshRef.current();
      setLastRefreshed(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === 'visible') {
        // Refresh immediately when tab becomes visible again
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (pauseWhenHidden && document.visibilityState === 'hidden') return;
      refresh();
    }, intervalMs);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled, pauseWhenHidden, refresh]);

  return { lastRefreshed, isRefreshing, refresh };
}