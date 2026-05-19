import { useState } from "react";
import { MessageSquare, WifiOff, Smartphone, Settings2, Save } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("offline");

  return (
    <div className="space-y-6 pb-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Configurations</h1>
        <p className="text-sm text-gray-500">Manage deep platform settings and AI integrations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden min-h-[500px]">
        
        {/* Sidebar for Settings */}
        <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-4 space-y-2">
           <button 
             onClick={() => setActiveTab('offline')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeTab === 'offline' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             <WifiOff size={18} /> Offline Resiliency
           </button>
           <button 
             onClick={() => setActiveTab('general')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeTab === 'general' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             <Settings2 size={18} /> General System
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeTab === 'ai' ? 'bg-white border border-gray-200 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
           >
             <MessageSquare size={18} /> AI Integrations
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-white">
          {activeTab === 'offline' && (
            <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="text-blue-500" /> SMS Fallback Configuration
                  </h2>
                  <p className="text-sm text-gray-500">Configure how Rahi behaves when drivers or riders lose 3G/4G connectivity during a ride.</p>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">SMS Ride Confirmation</div>
                      <div className="text-xs text-gray-500 mt-1">If driver app drops offline for &gt;2 mins during pickup, send SMS confirmation.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">SMS Final Receipt Network</div>
                      <div className="text-xs text-gray-500 mt-1">Provider used for offline end-of-ride receipts.</div>
                    </div>
                    <select className="border border-gray-200 rounded-md text-sm px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                      <option>Twilio Global</option>
                      <option>AWCC Direct API</option>
                      <option>Roshan API</option>
                    </select>
                  </div>

                  <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">SMS Preview (Pashto)</div>
                     <div className="bg-white p-3 rounded-md text-sm font-sans flex gap-3 w-[70%]">
                        <Smartphone className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rahi:</strong> <br />
                          تاسو خپل منزل ته ورسیدئ. <br/>
                          کرایه: ۱۵۰ افغانۍ. <br/>
                          موټر چلوونکی: احمد. 
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                    <Save size={16} /> Save Offline Settings
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="text-gray-500 italic max-w-xl">
               General platform settings (commission caps, timeout thresholds, etc.) would be configured here.
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">AI Configuration (Claude)</h2>
                  <p className="text-sm text-gray-500">Control parameters for AI-driven Fare Suggestion and Chatbots.</p>
               </div>
               
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-4">
                  <div className="bg-amber-100 p-2 rounded-full"><MessageSquare className="text-amber-600" /></div>
                  <div>
                    <div className="font-bold text-amber-900 text-sm">Base Fuel Price (AFN/L)</div>
                    <div className="text-xs text-amber-700">Claude uses this to seed dynamic fair-price generation.</div>
                  </div>
                  <div className="ml-auto">
                    <input type="number" defaultValue={65} className="w-24 px-3 py-1.5 rounded-md border border-amber-300 text-amber-900 font-bold focus:ring-amber-500 focus:border-amber-500" />
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
