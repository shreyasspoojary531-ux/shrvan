import { contractPending } from './api';

// BACKEND TODO: replace only after verifying emergency point endpoints and payloads.
export const createEmergencyPoint = () => contractPending('Emergency points');
export const clearEmergencyPoint = () => contractPending('Emergency points');
