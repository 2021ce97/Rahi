import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import io from "socket.io-client";

export default function SosAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sos")
      .then(res => res.json())
      .then(data => setAlerts(data));

    const socket = io();
    socket.on("admin_sos_alert", (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center text-red-600 mb-3">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <h3 className="font-bold">Active SOS Alerts</h3>
      </div>
      <div className="space-y-2">
        {alerts.map((alert: any) => (
          <div key={alert.id} className="bg-white p-3 rounded-lg border border-red-100 flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold text-red-600 uppercase">{alert.role}</span>
              <span className="text-gray-600 ml-2">triggered SOS at {alert.location}</span>
            </div>
            <span className="text-xs text-gray-400">{new Date(alert.time).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
