import { contractPending } from './api';

// BACKEND TODO: replace only after verifying facility category endpoints and JSON shape.
export const getFacilities = () => contractPending('Facilities');
