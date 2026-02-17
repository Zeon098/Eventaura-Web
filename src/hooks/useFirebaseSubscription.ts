import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type SubscribeFn<T> = (
  onData: (data: T) => void,
  onError: (err: unknown) => void,
) => () => void;            // returns unsubscribe

export function useFirebaseSubscription<T>(
  queryKey: readonly unknown[],
  subscribeFn: SubscribeFn<T>,
  options: { enabled?: boolean; fallback?: T } = {},
) {
  const { enabled = true, fallback } = options;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(enabled);

  // Subscribe and push snapshots into cache
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    return subscribeFn(
      (data) => { queryClient.setQueryData<T>(queryKey, data); setLoading(false); },
      ()     => { queryClient.setQueryData<T>(queryKey, fallback as T); setLoading(false); },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...queryKey]);

  // Read from cache (subscription keeps it fresh — never self-fetches)
  const { data, error } = useQuery<T>({
    queryKey,
    enabled,
    queryFn: () => (queryClient.getQueryData<T>(queryKey) ?? fallback) as T,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return { data: data ?? (fallback as T), loading, error: error?.message ?? null };
}
