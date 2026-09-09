import { useCallback, useState } from 'react';
import { calculateRoute } from '../services/routingApi';

export function useRoute() {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const calculate = useCallback(async (payload) => {
    setState({ data: null, loading: true, error: null });
    try { setState({ data: await calculateRoute(payload), loading: false, error: null }); }
    catch (error) { setState({ data: null, loading: false, error }); }
  }, []);
  const clear = useCallback(() => setState({ data: null, loading: false, error: null }), []);
  return { ...state, calculate, clear };
}
