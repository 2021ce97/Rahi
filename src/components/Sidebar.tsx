import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CarFront, Map, DollarSign, Settings, ShieldCheck, MessageSquare, Layers, Globe } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Live Map", path: "/admin/map", icon: <Map size={20} /> },
    { name: "PD Zones", path: "/admin/zones", icon: <Layers size={20} /> },
    { name: "Drivers", path: "/admin/drivers", icon: <CarFront size={20} /> },
    { name: "Diaspora Gifts", path: "/admin/diaspora", icon: <Globe size={20} /> },
    { name: "Riders", path: "/admin/riders", icon: <Users size={20} /> },
    { name: "Transactions", path: "/admin/transactions", icon: <DollarSign size={20} /> },
    { name: "Verifications", path: "/admin/verifications", icon: <ShieldCheck size={20} /> },
    { name: "Support Tickets", path: "/admin/support", icon: <MessageSquare size={20} /> },
    { name: "Negotiation (Demo)", path: "/admin/negotiation", icon: <MessageSquare size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-full border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-teal-500">HamRah</span> Admin
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = path === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active 
                    ? "bg-teal-600/10 text-teal-500" 
                    : "hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
