# BUILD: GREEN CORRIDOR COMMAND SYSTEM (GCCS)

Build a complete emergency-routing and intelligent traffic-management platform called:

# 🚦 GREEN CORRIDOR COMMAND SYSTEM (GCCS)

The system has TWO separate interfaces:

1. **Command Center** — `/`
2. **Public Mobile Route Interface** — `/mobile`

Both must communicate with the same **C++ Crow backend**.

The existing C++ backend contains a road graph, nodes, edges, facilities and A* routing.

Do NOT replace the existing backend routing algorithm with JavaScript routing.

The C++ backend is the authoritative source for graph/pathfinding.

---

# SYSTEM ARCHITECTURE

```text
                         GREEN CORRIDOR SYSTEM
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
        COMMAND CENTER /                    MOBILE USER /mobile
                 │                                 │
                 │                                 │
                 └──────────────┬──────────────────┘
                                ▼
                         C++ CROW SERVER
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
           GRAPH             FACILITIES        ROUTING
       Nodes + Edges       Hospitals etc.       A*
                                │
                                ▼
                         Traffic / Obstacles
                                │
                                ▼
                         Dynamic Route
```

---

# PART 1 — COMMAND CENTER

Create a professional emergency command dashboard at:

```text
/
```

The dashboard should be designed like an emergency operations center.

---

# 1. MAIN DASHBOARD

Create:

```text
Dashboard
Map
Emergency Points
Hospitals
Ambulance Hubs
Police Stations
Fire Stations
Graph Editor
Routing
Traffic / Obstacles
Mobile Users
System Status
API Documentation
```

The map should be the main focus.

---

# 2. INTERACTIVE GRAPH MAP

Display the real backend graph.

Show:

* Nodes
* Edges
* Roads
* Intersections
* Node IDs
* Edge IDs
* Road IDs where available

Support:

```text
Zoom
Pan
Fit Graph
Refresh
Toggle Nodes
Toggle Edges
Toggle IDs
```

Example:

```text
Graph

Nodes: 73
Edges: 190

[Refresh Graph]

☑ Nodes
☑ Edges
☑ Node IDs
☐ Edge IDs
```

Do not hard-code graph data if the backend already provides it.

---

# 3. EMERGENCY POINT

Allow the operator to create an emergency point.

Button:

```text
+ Create Emergency Point
```

Then allow the operator to select:

* Existing graph node
* Map coordinate
* Road/intersection

Form:

```text
Emergency Point

Name:
Description:

Emergency Type:
○ Medical
○ Accident
○ Fire
○ Police
○ Other

Priority:
○ Critical
○ High
○ Medium
○ Low

Related Facility:
○ Ambulance Hub
○ Hospital
○ Police Station
○ Fire Station

[Create]
[Cancel]
```

Only one ACTIVE emergency point should exist at a time.

When one exists:

```text
Create Emergency Point
        DISABLED
```

Provide:

```text
[Clear Emergency Point]
```

Clearing it should re-enable creation.

---

# 4. EMERGENCY FACILITIES

Display separately:

## Hospitals

🏥 Hospital markers

## Ambulance Hubs

🚑 Ambulance markers

## Police Stations

🚓 Police markers

## Fire Stations

🚒 Fire station markers

All should be loaded from backend APIs.

Allow the operator to select each facility.

Example:

```text
HOSPITALS

○ City Hospital
○ District Hospital
○ Emergency Medical Center
```

Selecting one highlights it on the map.

---

# 5. SET START / SET END

Emergency point = START.

Facility = END.

Example:

```text
START

🚨 Emergency Point
Node 24


END

🏥 City Hospital
Node 63

[Calculate Emergency Route]
```

Send this to the C++ backend.

---

# 6. EMERGENCY ROUTE

Backend calculates:

```text
A*
```

Frontend displays:

```text
GREEN CORRIDOR ACTIVE

Start:
Emergency Point

Destination:
City Hospital

Distance:
12.4 km

Estimated Time:
4m 48s

Path:

24 → 25 → 31 → 40 → 52 → 63
```

Highlight the path on the map.

---

# 7. CLEAR ROUTE

Button:

```text
✕ Clear Route
```

This should:

* Remove route visualization
* Clear start/end state
* Clear route documentation
* Keep graph visible
* Keep facilities visible

Do not reload the page.

---

# 8. GRAPH EDITOR

Create:

```text
Graph Editor
```

Allow backend-supported operations:

```text
Add Node
Edit Node
Delete Node

Add Edge
Edit Edge
Delete Edge
```

Show:

```text
Node ID
X
Y
Connected Nodes
Connected Edges
```

For edges:

```text
Edge ID
From
To
Cost
Confidence
```

Only perform modifications through backend APIs.

---

# PART 2 — DYNAMIC TRAFFIC / OBSTACLE SYSTEM

The command center must allow operators to add dynamic objects to the road network.

This is important because emergency routing should account for changing road conditions.

Create:

# Traffic & Obstacles

Allow adding:

```text
Vehicle
Person
Accident
Road Block
Traffic Jam
Construction
Police Checkpoint
Fire Incident
Flood
Other
```

The UI should allow the operator to select a road/node/coordinate.

Example:

```text
Add Dynamic Object

Type:
[ Vehicle ]

Location:
Node 42

Severity:
[ Low / Medium / High / Critical ]

Description:

Duration:
[ Temporary / Permanent ]

[Add Object]
```

Display these objects on the map.

---

# 9. DYNAMIC OBJECT BEHAVIOUR

Each object should be represented in the backend.

Example:

```json
{
  "id": "OBJ-102",
  "type": "vehicle",
  "node_id": 42,
  "severity": "medium",
  "active": true
}
```

The routing engine should be able to consider these objects.

For example:

```text
Normal road:

Node 40 ─── Node 41 ─── Node 42

If Node 42 is blocked:

Node 40 ─── Node 41     X Node 42
```

The A* routing system should either:

* Increase the edge cost, or
* Mark the edge unavailable,

depending on the object type and backend implementation.

Do this in C++.

Do NOT fake this in React.

---

# PART 3 — PUBLIC MOBILE INTERFACE

Create a separate mobile-friendly interface:

```text
/mobile
```

This is intended for normal people / vehicles.

It must NOT expose the command-center controls.

The UI should work well on:

* Mobile phones
* Tablets
* Desktop browsers

---

# 10. MOBILE HOME SCREEN

Design a simple navigation interface.

Example:

```text
🚗 Green Corridor

Find a Route

Where are you?

[ Enter Road / Node / Coordinates ]

Where do you want to go?

[ Enter Destination ]

[ Find Route ]
```

Keep this interface much simpler than the command center.

---

# 11. MOBILE LOCATION INPUT

Allow users to specify their current location using:

### Option A — Road / Node

```text
Current Location

Road / Node Number:

[ 24 ]
```

### Option B — Coordinates

```text
Latitude:
[ ]

Longitude:
[ ]

[Use Coordinates]
```

### Option C — Map Selection

Allow the user to tap the map.

The selected point becomes:

```text
Your Location
```

If browser geolocation permission is available, optionally provide:

```text
📍 Use My Current Location
```

Do not make geolocation mandatory.

---

# 12. MOBILE DESTINATION

Allow destination selection using:

```text
Road / Node
Coordinates
Map
Searchable facility
```

For facilities:

```text
Hospitals
Ambulance Hubs
Police Stations
Fire Stations
```

Example:

```text
Destination

○ Enter Node
○ Enter Coordinates
○ Select on Map
○ Hospital
○ Police Station
○ Fire Station
```

---

# 13. NORMAL USER ROUTING

Normal users should be able to request a route:

```text
Current Location
        ↓
      CROW
        ↓
Graph + A*
        ↓
Destination
```

Example request:

```json
{
  "start": {
    "node_id": 24
  },
  "end": {
    "node_id": 63
  },
  "user_type": "public"
}
```

Backend response:

```json
{
  "success": true,
  "path": [24,25,31,40,52,63],
  "distance": 12.4,
  "estimated_time": 8.3
}
```

Display the path on the mobile map.

---

# 14. MOBILE ROUTE UI

After calculating:

```text
YOUR ROUTE

📍 Start
Node 24

🏁 Destination
Node 63

Distance
12.4 km

Estimated Time
8 min 18 sec

Route
24 → 25 → 31 → 40 → 52 → 63

[Clear Route]
```

Use a clean navigation-style map.

---

# 15. NORMAL USER VS EMERGENCY ROUTING

The backend must distinguish between:

```text
PUBLIC ROUTE

and

EMERGENCY ROUTE
```

Example:

```json
{
  "route_type": "public"
}
```

versus:

```json
{
  "route_type": "emergency",
  "priority": "critical"
}
```

Emergency routes can use different routing costs / rules.

The normal public route should NOT automatically receive emergency priority.

---

# 16. EMERGENCY CORRIDOR AWARENESS

This is very important.

If a Green Corridor is currently active:

```text
🚨 GREEN CORRIDOR ACTIVE
```

normal users should be informed.

For example:

```text
⚠ Emergency corridor active nearby.

Traffic may be redirected to keep the emergency route clear.
```

The backend should be able to identify roads/edges currently reserved or prioritized for emergency routing.

Public routes should avoid or appropriately penalize those roads where required.

---

# 17. DYNAMIC VEHICLE / PERSON PATH

Add a feature in the command center:

```text
Add User / Vehicle
```

The operator can create simulated or tracked moving objects.

Example:

```text
Add Object

Type:
○ Person
○ Car
○ Bus
○ Ambulance
○ Police Vehicle
○ Fire Truck
○ Other

Current Location:
Node / Coordinate

Destination:
Node / Coordinate

[Create Path]
```

When created:

```text
Object
  ↓
Start
  ↓
A*
  ↓
Path
```

Draw that path on the map.

---

# 18. MULTIPLE MOBILE USERS

The system should support multiple mobile clients.

For demonstration/testing, assume:

```text
Mobile 1
Mobile 2
Mobile 3
Mobile 4
```

Each mobile client should have a unique temporary session ID.

Example:

```text
MOBILE-001
MOBILE-002
MOBILE-003
MOBILE-004
```

Do NOT require user accounts for the demonstration.

The backend should maintain:

```text
mobile_id
current location
destination
current route
last update
status
```

---

# 19. MOBILE USER DASHBOARD

Command center should have:

```text
Mobile Users
```

Display:

```text
ACTIVE MOBILE USERS

MOBILE-001
Location: Node 24
Destination: Node 63
Status: Routing

MOBILE-002
Location: Node 31
Destination: Node 70
Status: Moving

MOBILE-003
Location: Node 18
Destination: Node 52
Status: Idle
```

Selecting a mobile user should highlight their position and route on the map.

---

# 20. LIVE LOCATION UPDATES

Create an API for mobile clients to update location.

Conceptually:

```text
POST /api/mobile/location
```

Request:

```json
{
  "mobile_id": "MOBILE-001",
  "node_id": 24,
  "latitude": 13.123,
  "longitude": 74.123
}
```

The backend should store the latest location.

Do not require continuous high-frequency polling.

Use a reasonable update interval.

---

# 21. MOBILE ROUTE REQUEST

Conceptually:

```text
POST /api/mobile/route
```

Request:

```json
{
  "mobile_id": "MOBILE-001",
  "start": {
    "node_id": 24
  },
  "destination": {
    "node_id": 63
  }
}
```

Backend calculates the route using the same graph engine.

---

# 22. PATH MANAGEMENT

The backend should treat paths as first-class objects.

Conceptual structure:

```cpp
struct Route
{
    int id;

    int startNode;
    int endNode;

    std::vector<int> pathNodes;
    std::vector<int> pathEdges;

    double distance;
    double estimatedTime;

    std::string type;

    bool active;
};
```

Possible route types:

```text
PUBLIC
EMERGENCY
AMBULANCE
POLICE
FIRE
```

The exact implementation can be adapted to the existing project.

---

# 23. ROUTE CONFLICT SYSTEM

The backend should be aware that multiple routes may exist simultaneously.

For example:

```text
Emergency Route:
24 → 25 → 31 → 40 → 52 → 63

Public Route:
10 → 15 → 31 → 40 → 45
```

The system should detect shared edges/nodes.

Example:

```text
CONFLICT

Edge 40 → 52

Used by:
🚑 Emergency Route
🚗 MOBILE-002
```

Emergency traffic should have priority.

The backend should be able to increase the cost of affected roads for public users.

---

# 24. ROUTE DOCUMENTATION

Every generated route should produce documentation.

For example:

```text
GREEN CORRIDOR ROUTE

Route ID:
GC-001

Type:
Emergency

Start:
Node 24

Destination:
Node 63

Algorithm:
A*

Path:
24 → 25 → 31 → 40 → 52 → 63

Edges:
...

Distance:
12.4 km

Estimated Time:
4m 48s

Priority:
CRITICAL

Status:
ACTIVE
```

For public routes:

```text
PUBLIC ROUTE

Route ID:
PUB-004

User:
MOBILE-002

Start:
Node 10

Destination:
Node 52

Distance:
...

Estimated Time:
...

Status:
ACTIVE
```

Provide:

```text
[Copy]
[Export]
```

---

# 25. BACKEND API DESIGN

Create a centralized frontend API layer.

Expected conceptual APIs:

## Graph

```text
GET /api/graph
GET /api/graph/nodes
GET /api/graph/edges
```

## Facilities

```text
GET /api/hospitals
GET /api/ambulance-hubs
GET /api/police
GET /api/fire-stations
```

## Emergency

```text
GET /api/emergency-points
POST /api/emergency-points
PUT /api/emergency-points/:id
DELETE /api/emergency-points/:id
```

## Emergency Routing

```text
POST /api/route
DELETE /api/route/:id
```

## Public Mobile

```text
POST /api/mobile/register
POST /api/mobile/location
POST /api/mobile/route
GET /api/mobile/:id
DELETE /api/mobile/:id
```

## Dynamic Objects

```text
GET /api/objects
POST /api/objects
PUT /api/objects/:id
DELETE /api/objects/:id
```

## System

```text
GET /api/status
```

These are conceptual APIs.

If existing Crow routes already exist, adapt the frontend to them instead of creating duplicate endpoints.

---

# 26. BACKEND REQUIREMENTS

Update the C++ backend to support:

```text
Graph
Nodes
Edges
Facilities
Emergency Points
Routes
Mobile Users
Dynamic Objects
Route Conflicts
```

Create appropriate C++ structures/classes.

For example:

```cpp
MobileUser
EmergencyPoint
DynamicObject
Route
Facility
```

Do not put all logic inside `main.cpp`.

Keep the existing graph/A* implementation modular.

---

# 27. ROUTING ENGINE

The existing A* engine remains the core routing engine.

Create routing options:

```cpp
RouteType::PUBLIC
RouteType::EMERGENCY
RouteType::AMBULANCE
RouteType::POLICE
RouteType::FIRE
```

Routing should be able to consider:

```text
Road cost
Distance
Confidence
Blocked roads
Dynamic objects
Emergency corridor
Route priority
```

Do not rewrite the existing A* implementation unless necessary.

Add a routing configuration layer around it.

---

# 28. DYNAMIC EDGE COST

Do NOT permanently modify the original graph edge cost when traffic changes.

Instead calculate an effective routing cost.

Conceptually:

```text
base cost
+
traffic penalty
+
dynamic obstacle penalty
+
emergency corridor penalty
```

For example:

```cpp
double getEffectiveCost(
    Edge* edge,
    const RoutingContext& context
);
```

This allows different users to receive different routes.

Example:

```text
Emergency:
Emergency corridor = LOW cost

Public:
Emergency corridor = HIGH cost
```

---

# 29. RATE LIMITING / DOS PROTECTION

Protect the Crow server against excessive requests.

Implement backend request protection.

At minimum:

```text
Per-IP rate limit
Request throttling
Maximum request body size
Maximum route request frequency
Maximum mobile location update frequency
```

Example policy:

```text
Route calculation:
reasonable limit per client

Location updates:
limited frequency

Graph refresh:
limited frequency
```

Return:

```text
HTTP 429
```

when a client exceeds the limit.

Frontend must handle 429 gracefully.

Do not implement anything intended to bypass rate limits.

---

# 30. FRONTEND REQUEST PROTECTION

Frontend must also prevent accidental request flooding.

Implement:

```text
Debouncing
Throttling
Request cancellation
Duplicate request prevention
Loading state
Disabled buttons while submitting
```

For example, repeatedly clicking:

```text
Find Route
```

should not send 100 requests.

---

# 31. REFRESH SYSTEM

Create:

```text
Refresh Graph
Refresh Facilities
Refresh Emergency Points
Refresh Mobile Users
Refresh Dynamic Objects
```

and:

```text
Refresh System
```

Do not reload the page.

Display:

```text
Last synchronized:
10:42:18

Status:
✓ Synchronized
```

---

# 32. SYSTEM STATUS

Display:

```text
SYSTEM STATUS

Crow Server:
● Online

Graph:
● Loaded

Routing:
● Ready

Facilities:
● Synchronized

Mobile Users:
4 Active

Emergency Corridor:
● Inactive
```

If an emergency route is active:

```text
Emergency Corridor:
🚨 ACTIVE
```

---

# 33. MOBILE UI DESIGN

The `/mobile` UI should be extremely simple.

Do NOT expose:

* Graph editor
* Facility editor
* Emergency point creation
* Backend configuration
* Admin controls

The mobile user only needs:

```text
My Location
Destination
Find Route
Map
Route information
Clear Route
```

---

# 34. MOBILE RESPONSIVE DESIGN

Optimize specifically for phones.

Large touch targets.

Simple forms.

Minimal text.

Example:

```text
┌─────────────────────────┐
│ 🚦 Green Corridor       │
├─────────────────────────┤
│                         │
│        MAP              │
│                         │
│     📍───────🏁         │
│                         │
├─────────────────────────┤
│ From                    │
│ [ Node / Location ]     │
│                         │
│ To                      │
│ [ Destination ]         │
│                         │
│ [      FIND ROUTE     ] │
└─────────────────────────┘
```

---

# 35. FOUR-MOBILE DEMO

The application should be easy to test with four phones.

Open:

```text
/mobile
```

on four devices.

Each device receives a unique:

```text
MOBILE-001
MOBILE-002
MOBILE-003
MOBILE-004
```

The command center sees all four.

Each can have a different:

```text
location
destination
route
```

---

# 36. SECURITY

Do not expose administrative APIs directly without protection.

Separate:

```text
Public APIs
Admin APIs
```

Public:

```text
/mobile
mobile route
mobile location
```

Admin:

```text
graph editing
facility editing
emergency creation
dynamic object management
```

Add a simple authentication mechanism for admin APIs if the existing backend does not already have one.

---

# 37. DATA FLOW

### Emergency

```text
Operator
 ↓
Create Emergency
 ↓
Select Hospital
 ↓
Set Start + End
 ↓
POST /api/route
 ↓
C++ A*
 ↓
Path
 ↓
Map
 ↓
Green Corridor
```

### Normal User

```text
Mobile
 ↓
Enter Location
 ↓
Enter Destination
 ↓
POST /api/mobile/route
 ↓
C++ A*
 ↓
Public Route
 ↓
Mobile Map
```

### Dynamic Object

```text
Operator
 ↓
Add Vehicle / Accident / Block
 ↓
Crow Backend
 ↓
Dynamic Object
 ↓
Routing Cost Changes
 ↓
Future A* calculations use updated costs
```

---

# 38. IMPORTANT — DO NOT CREATE A FAKE DEMO

If the backend is available:

```text
Use real backend.
```

If some APIs do not exist yet:

```text
Clearly identify them as BACKEND TODO.
```

You may create mock data ONLY when:

```text
VITE_USE_MOCK_API=true
```

Never silently substitute mock data for real data.

---

# 39. PROJECT STRUCTURE

Use a clean structure such as:

```text
frontend/

src/
    components/
        Map/
        Graph/
        Facilities/
        Emergency/
        Routing/
        Mobile/
        Traffic/
        Documentation/

    pages/
        Dashboard/
        EmergencyPoints/
        Facilities/
        GraphEditor/
        Routing/
        Traffic/
        MobileUsers/
        Documentation/

    services/
        api.js
        graphApi.js
        facilityApi.js
        emergencyApi.js
        routingApi.js
        mobileApi.js
        objectApi.js

    hooks/
        useGraph.js
        useFacilities.js
        useRoute.js
        useMobile.js
        useDynamicObjects.js

    utils/
        routing.js
        requestManager.js
        routeDocumentation.js
```

Backend:

```text
backend/

graph/
routing/
nodes/
edges/
facilities/
emergency/
mobile/
traffic/
routes/
api/
```

Adapt this structure to the existing project rather than destroying the existing codebase.

---

# 40. FINAL UI GOAL

The final application should feel like a real emergency traffic-control platform.

Command center:

```text
┌──────────────────────────────────────────────────────────┐
│ 🚦 GREEN CORRIDOR COMMAND SYSTEM                        │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│ Dashboard  │                                             │
│ Map        │                  LIVE MAP                   │
│ Emergency  │                                             │
│ Hospitals  │       🚨 ──────────────── 🏥               │
│ Ambulance  │                                             │
│ Police     │       ●────●────●────●────●                 │
│ Fire       │          Road Graph                         │
│ Graph      │                                             │
│ Traffic    │                                             │
│ Mobile     │                                             │
│            │                                             │
├────────────┴─────────────────────────────────────────────┤
│ SYSTEM: ● ONLINE    GRAPH: 73 NODES    EDGES: 190       │
└──────────────────────────────────────────────────────────┘
```

Mobile:

```text
┌───────────────────────┐
│ 🚦 Green Corridor     │
│                       │
│       LIVE MAP        │
│                       │
│       📍              │
│        ╲              │
│         ╲             │
│          🏁           │
│                       │
│ From                  │
│ [ Current location ]  │
│                       │
│ Destination           │
│ [ Enter destination ] │
│                       │
│ [ FIND ROUTE ]        │
│                       │
│ 12.4 km • 8 min       │
└───────────────────────┘
```

---

# 41. FINAL DEVELOPMENT PRIORITY

Implement in this order:

### Phase 1

Graph + map

### Phase 2

Hospitals / ambulance / police / fire

### Phase 3

Emergency point

### Phase 4

Emergency routing

### Phase 5

Route documentation

### Phase 6

Dynamic objects / traffic

### Phase 7

`/mobile`

### Phase 8

Multiple mobile users

### Phase 9

Public routing

### Phase 10

Emergency corridor interaction between public and emergency routes

### Phase 11

Rate limiting and request protection

### Phase 12

Polish, error handling, loading states and documentation

---

# MOST IMPORTANT BACKEND RULE

The system must NOT just draw paths in React.

The actual routing flow must be:

```text
React
   ↓
HTTP
   ↓
C++ Crow
   ↓
Routing Context
   ↓
A*
   ↓
Graph
   ↓
Path
   ↓
Crow JSON Response
   ↓
React Map
```

The same routing engine should serve:

```text
🚑 Emergency vehicles
🚓 Police
🚒 Fire
🚗 Normal vehicles
👤 Public/mobile users
```

but with different routing priorities and constraints.

The final result should be a **functional Green Corridor Command System**, not a static dashboard mockup.