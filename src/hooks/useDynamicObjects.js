import { useCallback, useState } from 'react';
import { getDynamicObjects } from '../services/objectApi';

export function useDynamicObjects() {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const refresh = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try { setState({ data: await getDynamicObjects(), loading: false, error: null }); }
    catch (error) { setState({ data: null, loading: false, error }); }
  }, []);
  return { ...state, refresh };
}
