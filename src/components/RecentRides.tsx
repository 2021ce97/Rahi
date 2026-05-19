import { useState, useEffect } from "react";

interface Ride {
  id: string;
  riderName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: string;
  time: string;
}

export default function RecentRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides")
      .then((res) => res.json())
      .then((data) => {
        setRides(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rides:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recent Rides</h2>
        <button className="text-sm text-amber-600 font-medium hover:text-amber-700">View All</button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="text-center py-4 text-sm text-gray-500 animate-pulse">Loading real-time data...</div>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{ride.id}</span>
                  <span className="text-sm font-medium ml-2">{ride.riderName}</span>
                </div>
                <span className="font-bold text-sm">{ride.fare} AFN</span>
              </div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="truncate">{ride.pickup}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="truncate">{ride.dropoff}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                <span className="text-xs text-gray-500">{ride.time}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  ride.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  ride.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ride.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
