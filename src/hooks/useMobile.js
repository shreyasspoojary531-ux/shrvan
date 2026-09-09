import { useCallback, useState } from 'react';
import { getMobileUsers } from '../services/mobileApi';

export function useMobile() {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const refresh = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try { setState({ data: await getMobileUsers(), loading: false, error: null }); }
    catch (error) { setState({ data: null, loading: false, error }); }
  }, []);
  return { ...state, refresh };
}
