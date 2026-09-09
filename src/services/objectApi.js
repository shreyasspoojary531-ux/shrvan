import { contractPending } from './api';

// BACKEND TODO: verify traffic and dynamic-object endpoints before implementation.
export const getDynamicObjects = () => contractPending('Dynamic objects');
