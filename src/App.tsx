/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Riders from "./pages/Riders";
import Transactions from "./pages/Transactions";
import Verifications from "./pages/Verifications";
import Support from "./pages/Support";
import LiveNegotiation from "./pages/LiveNegotiation";
import Zones from "./pages/Zones";
import Diaspora from "./pages/Diaspora";
import Settings from "./pages/Settings";
import RiderApp from "./app/rider/RiderApp";
import DriverApp from "./app/driver/DriverApp";

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="riders" element={<Riders />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="verifications" element={<Verifications />} />
          <Route path="support" element={<Support />} />
          <Route path="negotiation" element={<LiveNegotiation />} />
          <Route path="zones" element={<Zones />} />
          <Route path="diaspora" element={<Diaspora />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Mobile Experience Mocks */}
        <Route path="/app/rider" element={<RiderApp />} />
        <Route path="/app/driver" element={<DriverApp />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
