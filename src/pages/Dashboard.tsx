import StatCards from "../components/StatCards";
import LiveMap from "../components/LiveMap";
import RecentRides from "../components/RecentRides";
import SosAlerts from "../components/SosAlerts";

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kabul Operations Overview</h1>
      </div>
      
      <SosAlerts />
      <StatCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMap />
        </div>
        <div className="lg:col-span-1">
          <RecentRides />
        </div>
      </div>
    </div>
  );
}
