import { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, CheckCircle2, ShieldAlert } from "lucide-react";

interface Rider {
  id: string;
  name: string;
  phone: string;
  joinDate: string;
  totalRides: number;
  rating: number;
  status: string;
}

export default function Riders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => {
        setRiders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching riders:", err);
        setLoading(false);
      });
  }, []);

  const filteredRiders = riders.filter(
    (d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Management</h1>
          <p className="text-sm text-gray-500">View and manage passenger accounts, reviews, and safety flags.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search riders by name, phone, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
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
                <th className="px-6 py-4 font-medium">Rider</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
                <th className="px-6 py-4 font-medium">Total Rides</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 animate-pulse">
                    Loading rider records...
                  </td>
                </tr>
              ) : filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {rider.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{rider.name}</div>
                        <div className="text-xs text-gray-500">{rider.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{rider.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{rider.joinDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{rider.totalRides}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      rider.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                      rider.status === 'Flagged' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {rider.status === 'Active' && <CheckCircle2 size={14} />}
                      {rider.status === 'Flagged' && <ShieldAlert size={14} />}
                      {rider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-1">
                    <span className="text-amber-500">★</span> {rider.rating}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
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
