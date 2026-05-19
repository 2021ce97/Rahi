import { useState, useEffect } from "react";
import { Layers, MapPin, Edit3, PlusCircle } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  type: string;
  baseMultiplier: number;
  activeDrivers: number;
  status: string;
}

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/zones")
      .then((res) => res.json())
      .then((data) => {
        setZones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching zones:", err);
        setLoading(false);
      });
  }, []);
  return (
    <div className="space-y-6 pb-6 w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neighborhood (PD) Zones</h1>
          <p className="text-sm text-gray-500">Manage demand multipliers and base fares per Kabul Police District.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <PlusCircle size={18} /> Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-50 border-b border-indigo-100 text-indigo-800 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Zone Name</th>
                <th className="px-6 py-4 font-bold">Demand Type</th>
                <th className="px-6 py-4 font-bold">Base Multiplier</th>
                <th className="px-6 py-4 font-bold">Active Drivers</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
                    Loading zone configurations...
                  </td>
                </tr>
              ) : zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-500" /> {zone.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      zone.type === 'Very High Demand' ? 'bg-red-100 text-red-700' :
                      zone.type === 'High Demand' ? 'bg-orange-100 text-orange-700' :
                      zone.type === 'Medium Demand' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {zone.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-700">
                    {zone.baseMultiplier}x
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{zone.activeDrivers} cars</td>
                  <td className="px-6 py-4">
                     <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-sm text-white p-6">
           <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300 mb-4">
              <Layers size={20} /> Zone AI Intelligence
           </h2>
           <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Live Suggestion</p>
                 <p className="font-medium text-sm">Demand spiking in PD6 (Karte Seh) due to university exams. Recommend increasing multiplier to <span className="text-orange-400 font-bold">1.4x</span>.</p>
                 <button className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded transition-colors">Apply Multiplier</button>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                 <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Driver Nudge</p>
                 <p className="font-medium text-sm">Only 8 active drivers in Wazir Akbar Khan. Broadcast push notification to offline drivers?</p>
                 <button className="mt-3 w-full bg-transparent border border-gray-500 hover:border-gray-400 text-gray-300 text-xs font-bold py-2 rounded transition-colors">Send Nudge</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
