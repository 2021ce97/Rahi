import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Filter, Layers } from "lucide-react";

// Fix for default leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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

export default function LiveMap() {
  const [showOnline, setShowOnline] = useState(true);
  const [showInRide, setShowInRide] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showZones, setShowZones] = useState(false);

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
        console.error("Error fetching map drivers:", err);
        setLoading(false);
      });
  }, []);

  // Center roughly on Kabul
  const center: [number, number] = [34.52813, 69.17233];

  const visibleDrivers = drivers.filter(d => 
    (d.status === 'online' && showOnline) ||
    (d.status === 'in-ride' && showInRide) ||
    (d.status === 'offline' && showOffline)
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Live Kabul Operations</h2>
        <div className="flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
             <Filter size={14} className="text-gray-500" />
             <label className="flex items-center gap-1 cursor-pointer">
               <input type="checkbox" checked={showOnline} onChange={(e) => setShowOnline(e.target.checked)} className="accent-amber-500" />
               <span className="w-2 h-2 rounded-full bg-green-500 ml-1"></span> Online
             </label>
             <label className="flex items-center gap-1 cursor-pointer ml-2">
               <input type="checkbox" checked={showInRide} onChange={(e) => setShowInRide(e.target.checked)} className="accent-amber-500" />
               <span className="w-2 h-2 rounded-full bg-amber-500 ml-1"></span> In-Ride
             </label>
             <label className="flex items-center gap-1 cursor-pointer ml-2">
               <input type="checkbox" checked={showOffline} onChange={(e) => setShowOffline(e.target.checked)} className="accent-amber-500" />
               <span className="w-2 h-2 rounded-full bg-gray-400 ml-1"></span> Offline
             </label>
          </div>
          
          <button 
             onClick={() => setShowZones(!showZones)}
             className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-colors ${showZones ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
          >
            <Layers size={14} /> Zones Heatmap
          </button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden flex-1 border border-gray-200 z-0 relative flex">
         {loading ? (
             <div className="m-auto text-sm text-gray-500 animate-pulse">Loading Live Map Data...</div>
         ) : (
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {visibleDrivers.map((driver) => (
                <Marker key={driver.id} position={[driver.lat, driver.lng]}>
                  <Popup>
                    <div className="font-sans">
                      <div className="font-bold">{driver.name}</div>
                      <div className="text-xs text-gray-500">{driver.vehicle}</div>
                      <div className="text-xs mt-1 font-medium capitalize">
                        Status: <span className={
                          driver.status === 'in-ride' ? 'text-amber-600' : 
                          driver.status === 'online' ? 'text-green-600' : 'text-gray-500'
                        }>{driver.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Highlight some PD drop zones when heatmaps are enabled */}
              {showZones && (
                <>
                  <Circle center={[34.5160, 69.1235]} pathOptions={{ fillColor: 'indigo', color: 'indigo', fillOpacity: 0.15, weight: 1 }} radius={1200}>
                     <Popup>PD6 Demand Zone (High)</Popup>
                  </Circle>
                  <Circle center={[34.5450, 69.1760]} pathOptions={{ fillColor: 'orange', color: 'orange', fillOpacity: 0.15, weight: 1 }} radius={1000}>
                     <Popup>Wazir Akbar Khan Zone (Medium)</Popup>
                  </Circle>
                  <Circle center={[34.5240, 69.1620]} pathOptions={{ fillColor: 'red', color: 'red', fillOpacity: 0.2, weight: 1 }} radius={800}>
                     <Popup>Shar-e-Naw Zone (Very High)</Popup>
                  </Circle>
                </>
              )}
            </MapContainer>
         )}
      </div>
    </div>
  );
}
