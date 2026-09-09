/**
 * Presentation-only routing helpers belong here.
 * Never calculate a path in React: C++ Crow A* remains authoritative.
 */
export function formatRouteDistance(distance) {
  return distance == null ? '--' : `${distance} km`;
}
