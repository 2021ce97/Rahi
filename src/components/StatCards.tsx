import { useState, useEffect } from "react";
import { Car, Route, DollarSign, ShieldAlert } from "lucide-react";

export default function StatCards() {
  const [statsData, setStatsData] = useState({
    activeDrivers: "84",
    ongoingRides: "32",
    commissionToday: "14500",
    pendingVerifications: "18"
  });

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then(r => r.json())
      .then(data => {
        if (data.stats) {
          setStatsData({
            activeDrivers: data.stats.activeDrivers.toString(),
            ongoingRides: data.stats.ongoingRides.toString(),
            commissionToday: data.stats.commissionToday.toLocaleString(),
            pendingVerifications: data.stats.pendingVerifications.toString()
          });
        }
      })
      .catch(console.error);
  }, []);

  const stats = [
    { title: "Active Drivers", value: statsData.activeDrivers, change: "Live", icon: <Car size={24} className="text-blue-500" />, trend: "up" },
    { title: "Ongoing Rides", value: statsData.ongoingRides, change: "Live", icon: <Route size={24} className="text-emerald-500" />, trend: "up" },
    { title: "Commission Today (AFN)", value: statsData.commissionToday, change: "Live", icon: <DollarSign size={24} className="text-amber-500" />, trend: "down" },
    { title: "Pending Verifications", value: statsData.pendingVerifications, change: "Action Needed", icon: <ShieldAlert size={24} className="text-red-500" />, trend: "neutral" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-xs font-medium mb-1 ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
