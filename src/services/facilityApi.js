import { request } from './api';

/**
/api/facilities endpoint returns:
{
  "success": true,
  "hospitals": [ { "id": "H1", "name": "City General Hospital", "x": 150, "y": 100 }, ... ],
  "ambulanceHubs": [ { "id": "A1", "name": "Central Ambulance Station", "x": 270, "y": 220 }, ... ],
  "policeStations": [ { "id": "P1", "name": "District 1 Police HQ", "x": 510, "y": 340 }, ... ],
  "fireStations": [ { "id": "F1", "name": "Fire Station #4", "x": 750, "y": 460 }, ... ]
}
*/
export async function getFacilities() {
  try {
    const res = await request('/facilities');
    if (res && res.success) {
      return {
        hospitals: res.hospitals || [],
        ambulanceHubs: res.ambulanceHubs || [],
        policeStations: res.policeStations || [],
        fireStations: res.fireStations || [],
      };
    }
    throw new Error('Malformed facility response');
  } catch (err) {
    console.warn('[facilityApi] Backend facilities unreachable, using fallback:', err.message);
    return getFallbackFacilities();
  }
}

function getFallbackFacilities() {
  return {
    hospitals: [
      { id: 'HOSP-101', name: 'Metro General Hospital', x: 270, y: 100 },
      { id: 'HOSP-102', name: 'St. Jude Trauma Center', x: 750, y: 340 },
    ],
    ambulanceHubs: [
      { id: 'AMB-201', name: 'Downtown EMS Station 1', x: 390, y: 220 },
      { id: 'AMB-202', name: 'Northside Rescue Hub', x: 630, y: 100 },
    ],
    policeStations: [
      { id: 'POL-301', name: 'Central Precinct 1', x: 510, y: 220 },
      { id: 'POL-302', name: 'Traffic Control Station B', x: 150, y: 460 },
    ],
    fireStations: [
      { id: 'FIRE-401', name: 'Fire Engine House #12', x: 870, y: 220 },
      { id: 'FIRE-402', name: 'South Suburban Fire Station', x: 390, y: 580 },
    ],
  };
}

