# Rahi (حمراہ) - Afghan Ride-Hailing Platform
## Deep Research & Strategic Master Plan

**Project Name:** Rahi ("Companion" in Dari/Pashto)
**Target Market:** Kabul, Afghanistan (Initial MVP), expanding nationwide.

---

## 1. Executive Summary
Rahi is Afghanistan's first truly local, culturally intelligent, fare-negotiable ride-hailing platform. Built on a peer-to-peer price negotiation model (similar to InDrive), it caters specifically to the Afghan reality: cash-dominant economy, lack of formal addresses, and unpredictable market conditions.

### Why Afghanistan? Why Now?
*   **Zero major competitors:** Uber, Careem, Bolt are not active.
*   **Expanding Connectivity:** 27.7M mobile connections, 7.88M internet users (18.4% penetration), and 4.8M 4G users.
*   **Target Density:** Kabul has ~6M+ population with severe traffic and unorganized informal taxis.
*   **Favorable Model:** Informal taxis already operate on negotiation. Rahi digitizes this existing behavior.

---

## 2. Core Business Model (Peer-to-Peer)

### How It Works
1.  **Rider Posts Ride:** Sets pickup/destination (via landmarks), proposes a fare in AFN.
2.  **Drivers See Request:** Nearby drivers see the request and can Accept, Counter-offer (e.g., if traffic is bad), or Ignore.
3.  **Rider Chooses:** Rider sees counter-offers, driver ratings, and ETAs, then selects the best option.
4.  **Ride & Payment:** Ride completes, payment is made primarily in **Cash**.

### Revenue Strategy
*   **Primary:** 8–10% commission per ride (deducted automatically from a pre-loaded driver balance).
*   **Incentives:** 0% commission for the first 3 months to quickly acquire drivers.

---

## 3. Unique Platform Features (The Competitive Moat)

1.  **Landmark-Based Navigation (محله نویسی):** Formal street addresses are rare. Users navigate using landmarks ("Near PD6 mosque", "Behind Arg"). Built into the search engine.
2.  **Fuel Price Index:** Live adjustment and visibility of petrol prices in-app. Auto-suggests a fair fare range, ensuring transparent negotiation when fuel spikes.
3.  **Offline-Capable Cashless Receipts:** Rides confirmed and receipts sent via SMS for moments/areas with dropped internet.
4.  **Tazkira Verification System:** Drivers verified via OCR scans of the Afghan Tazkira (national ID card) to guarantee passenger safety and trust.
5.  **Neighborhood (PD) Zone Pricing:** Kabul is divided into Police Districts (PD1–PD22). Provides heatmaps of typical fares between PDs to prevent overcharging.
6.  **Diaspora Ride Gift Feature:** Diaspora in USA/Europe can gift rides to family in Kabul, paying with international cards (Stripe) while the local driver is paid in AFN.
7.  **Driver Cooperative Model:** Drivers completing 100+ rides become "Rahi Partners" for reduced commissions (5%).
8.  **Prayer Time Smart Scheduling:** Shows prayer times (Azan). Drivers can tap "At Prayer" to go offline for 15 mins.
9.  **Community Safety Network:** Crowdsourced alerts for traffic jams, road blocks, or checkpoints.

*(Note: Features contrary to local feasibility have been strictly excluded from this plan).*

---

## 4. Technology Stack

*   **Mobile Apps (Rider & Driver):** React Native + Expo (Android focus).
*   **Web / Admin Dashboard:** React, Vite, Tailwind CSS (Current Workspace).
*   **Backend:** Node.js, Express.js.
*   **Real-time Layer:** Socket.IO for live negotiation and GPS.
*   **Database:** MongoDB Atlas (Primary), Redis (Caching), Firebase RTDB (Live GPS).
*   **Maps:** Mapbox (Better cost model for startups, good OSM Kabul data) fallback to OpenStreetMap.
*   **Authentication & SMS:** Twilio or direct Afghan carrier APIs (Roshan/AWCC).
*   **AI Integrations:** Claude API (Fare suggestion/chatbots), Gemini API (OCR for Tazkira handling).

---

## 5. Phased Development Roadmap (Accelerated)

### Phase 1: MVP Foundation & Architecture (Weeks 1-2)
*   **Goal:** Initialize project structure, database schemas, and core backend logic.
*   **Deliverables:**
    *   Research documentation & project phasing.
    *   Admin Dashboard scaffolding (Web).
    *   Authentication & User/Driver schemas.
    *   Map integration sandbox.

### Phase 2: Core Platform Build (Weeks 3-5)
*   **Goal:** Build the primary negotiation engine and interfaces.
*   **Deliverables:**
    *   Ride Request and Bidding system via WebSockets.
    *   Tazkira verification mockups/backend.
    *   Cash commission wallet logic.

### Phase 3: Beta Launch & Testing (Week 6)
*   **Goal:** Internal testing and pre-launch QA.
*   **Deliverables:**
    *   Kabul PD Zone pricing logic.
    *   SMS notification fallbacks.
    *   Finalize Admin controls.

### Phase 4: Scale & Expansion (Weeks 7+)
*   **Goal:** Launch to first 100 drivers in Kabul.
*   **Deliverables:**
    *   Diaspora payments hookup.
    *   Advanced AI fare predictions.
