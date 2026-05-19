import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search by Tazkira, Phone, or Ride ID..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
