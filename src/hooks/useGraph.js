import { useCallback, useState } from 'react';
import { getGraph } from '../services/graphApi';

export function useGraph() {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const refresh = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try { setState({ data: await getGraph(), loading: false, error: null }); }
    catch (error) { setState({ data: null, loading: false, error }); }
  }, []);
  return { ...state, refresh };
}
