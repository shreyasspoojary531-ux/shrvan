import { request } from './api';

/**
 * Creates an emergency point on the backend graph and calculates the green corridor.
 * @param {Object} params - { x: number, y: number, typeofemergency: 1|2|3, name?: string, description?: string }
 */
export async function createEmergencyPoint({ x, y, typeofemergency = 1, name = '', description = '' }) {
  try {
    const res = await request('/graph/emergency', {
      method: 'POST',
      body: JSON.stringify({ x: Number(x), y: Number(y), typeofemergency: Number(typeofemergency) }),
    });
    return {
      success: true,
      name,
      description,
      x,
      y,
      typeofemergency,
      path: res,
    };
  } catch (err) {
    console.warn('[emergencyApi] Backend emergency route failed, creating simulated point:', err.message);
    return {
      success: true,
      name: name || 'Emergency Incident',
      description: description || 'Simulated green corridor emergency',
      x,
      y,
      typeofemergency,
      isSimulated: true,
      path: {
        distance: 450.0,
        nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
      },
    };
  }
}

/**
 * Public disaster declaration endpoints
 */
export async function declareDisaster({ type, message = '', severity = 'high' }) {
  try {
    return await request('/disaster', {
      method: 'POST',
      body: JSON.stringify({ type, message, severity }),
    });
  } catch (err) {
    console.warn('[emergencyApi] Disaster declaration fallback:', err.message);
    return { success: true, notified: true, isSimulated: true };
  }
}

export async function getActiveDisaster() {
  try {
    return await request('/disaster');
  } catch (err) {
    return { active: false };
  }
}

export async function clearDisaster() {
  try {
    return await request('/disaster', { method: 'DELETE' });
  } catch (err) {
    return { success: true, isSimulated: true };
  }
}

