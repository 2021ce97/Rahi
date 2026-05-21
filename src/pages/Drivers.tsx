import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: string;
  lat: number;
  lng: number;
  rating: number;
}

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false);
      });
  }, []);

  const filteredDrivers = drivers.filter(
    (d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
        <button className="bg-teal-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Add Driver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search drivers by name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Driver</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
                    Loading driver data...
                  </td>
                </tr>
              ) : filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{driver.vehicle}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{driver.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      driver.status === 'online' ? 'bg-green-50 text-green-700 border-green-200' :
                      driver.status === 'in-ride' ? 'bg-teal-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {driver.status === 'online' && <CheckCircle2 size={14} />}
                      {driver.status === 'in-ride' && <Clock size={14} />}
                      {driver.status === 'offline' && <XCircle size={14} />}
                      {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">⭐ {driver.rating}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
