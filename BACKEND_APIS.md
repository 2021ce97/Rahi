# Backend Handoff Documentation

This document outlines the mock APIs and Socket.IO events used in the Rahi application prototype. Backend engineers should implement these routes and WebSocket events to replace the current mock data.

## REST APIs

### Admin Verifications
- **Endpoint:** `GET /api/verifications`
- **Description:** Returns a list of driver Tazkira verifications.
- **Response:**
  ```json
  [
    {
       "id": "v1",
       "driverId": "d1",
       "driverName": "Ahmad Noor",
       "tazkiraImage": "URL",
       "status": "pending",
       "submittedAt": "2026-05-18T10:00:00Z"
    }
  ]
  ```

### Rider History
- **Endpoint:** `GET /api/rider/history`
- **Description:** Returns a list of past rides for the authenticated rider.
- **Response:**
  ```json
  [
    {
      "id": "r1",
      "date": "2026-05-18",
      "pickup": "Kabul University",
      "dropoff": "Kote Sangi",
      "fare": 120,
      "driver": "Ahmad N.",
      "status": "completed"
    }
  ]
  ```

## Socket.IO Events

### Connection Events
- **connect:** Fired when a client connects.
- **disconnect:** Fired when a client disconnects.

### Ride Negotiation
- **`request_ride` (Client -> Server)**
  - **Payload:** `{ pickup: string, dropoff: string, offer: string, riderSocketId: string }`
  - **Description:** Broadcasts a ride request to all available drivers.

- **`new_ride_request` (Server -> Client)**
  - **Payload:** `{ id: string, pickup: string, dropoff: string, offer: string, riderSocketId: string, distance: string, time: string }`
  - **Description:** Received by driver apps when a new request is broadcasted.

- **`submit_bid` (Client -> Server)**
  - **Payload:** `{ requestId: string, riderSocketId: string, driverSocketId: string, fareAmount: number }`
  - **Description:** Driver submits a counter-offer or accepts the bid.

- **`bid_received` (Server -> Client)**
  - **Payload:** `{ id: string, driverSocketId: string, driverName: string, vehicle: string, rating: number, eta: string, fareAmount: number }`
  - **Description:** Received by the rider when a driver bids on their request.

- **`accept_bid` (Client -> Server)**
  - **Payload:** Bid Object + `riderSocketId`
  - **Description:** Rider accepts a specific bid. 

- **`ride_accepted` (Server -> Client)**
  - **Payload:** `{ riderSocketId: string, bid: Bid }`
  - **Description:** Received by the driver whose bid was accepted.

### Real-Time Tracking & Status
- **`driver_location_update` (Client -> Server)**
  - **Payload:** `{ riderSocketId: string, lat: number, lng: number }`
  - **Description:** Driver sends live GPS coordinates.

- **`driver_location_update` (Server -> Client)**
  - **Payload:** `{ lat: number, lng: number }`
  - **Description:** Server forwards the driver coordinates to the specific rider.

- **`ride_status_update` (Client -> Server)**
  - **Payload:** `{ riderSocketId: string, status: string }`
  - **Description:** Driver updates status ("En route to pickup", "Arrived at pickup", "In ride", "End ride").

- **`ride_status_update` (Server -> Client)**
  - **Payload:** `{ status: string }`
  - **Description:** Server forwards the ride status to the specific rider.

### In-App Chat
- **`chat_message` (Client -> Server)**
  - **Payload:** `{ targetSocketId: string, sender: string, message: string }`
  - **Description:** Sent by either rider or driver.

- **`chat_message` (Server -> Client)**
  - **Payload:** `{ sender: string, message: string }`
  - **Description:** Delivered to the target client.

### Cancellation
- **`cancel_ride` (Client -> Server)**
  - **Payload:** `{ role: "Rider" | "Driver", reason: string, targetSocketId: string }`
  - **Description:** Sent when a ride is cancelled.

- **`ride_cancelled` (Server -> Client)**
  - **Payload:** `{ role: string, reason: string }`
  - **Description:** Delivered to the other party to notify them of cancellation.

### Ratings / Reviews
- **`rate_rider` (Client -> Server)**
  - **Payload:** `{ riderSocketId: string, rating: number, review: string }`
  - **Description:** Sent by the driver after a ride is completed to establish a rating and review for the rider.
