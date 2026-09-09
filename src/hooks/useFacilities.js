import { useCallback, useState } from 'react';
import { getFacilities } from '../services/facilityApi';

export function useFacilities() {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const refresh = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try { setState({ data: await getFacilities(), loading: false, error: null }); }
    catch (error) { setState({ data: null, loading: false, error }); }
  }, []);
  return { ...state, refresh };
}
