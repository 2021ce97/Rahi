import { Car, Route, DollarSign, ShieldAlert } from "lucide-react";

export default function StatCards() {
  const stats = [
    { title: "Active Drivers", value: "84", change: "+12%", icon: <Car size={24} className="text-blue-500" />, trend: "up" },
    { title: "Ongoing Rides", value: "32", change: "+5%", icon: <Route size={24} className="text-emerald-500" />, trend: "up" },
    { title: "Commission Today (AFN)", value: "14,500", change: "-2%", icon: <DollarSign size={24} className="text-amber-500" />, trend: "down" },
    { title: "Pending Verifications", value: "18", change: "Action Needed", icon: <ShieldAlert size={24} className="text-red-500" />, trend: "neutral" },
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
