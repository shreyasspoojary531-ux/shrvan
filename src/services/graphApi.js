import { contractPending } from './api';

// BACKEND TODO: replace only after verifying the actual Crow handler and JSON shape.
export const getGraph = () => contractPending('Graph');
